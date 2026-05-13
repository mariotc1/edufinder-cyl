<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * BLOCK SUSPICIOUS IPS MIDDLEWARE
 *
 * Bloquea IPs que han sido marcadas como sospechosas por otros middlewares.
 * También permite configurar una lista negra manual de IPs.
 */
class BlockSuspiciousIPs
{
    // IPs permanentemente bloqueadas (añadir manualmente si es necesario)
    private array $permanentBlacklist = [
        // '1.2.3.4',
    ];

    // User-agents de bots conocidos maliciosos
    private array $blockedUserAgents = [
        'sqlmap',
        'nikto',
        'nmap',
        'masscan',
        'zgrab',
        'python-requests', // Comentar si usas scripts legítimos
        'curl', // Comentar si necesitas curl
        'wget',
        'scrapy',
        'phantom',
        'headless',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        $userAgent = strtolower($request->userAgent() ?? '');

        // 1. Verificar lista negra permanente
        if (in_array($ip, $this->permanentBlacklist)) {
            Log::warning('Blocked IP from permanent blacklist', ['ip' => $ip]);
            return $this->blockedResponse();
        }

        // 2. Verificar bloqueo temporal por actividad sospechosa
        if (Cache::get("blocked_ip:{$ip}")) {
            Log::info('Blocked IP from temporary blacklist', ['ip' => $ip]);
            return $this->blockedResponse();
        }

        // 3. Verificar User-Agent sospechoso (solo en rutas sensibles)
        foreach ($this->blockedUserAgents as $blocked) {
            if (str_contains($userAgent, $blocked)) {
                Log::warning('Blocked suspicious user agent', [
                    'ip' => $ip,
                    'user_agent' => $request->userAgent(),
                    'blocked_pattern' => $blocked,
                ]);

                // Incrementar contador de actividad sospechosa
                $this->incrementSuspiciousCounter($ip);

                return $this->blockedResponse();
            }
        }

        // 4. Detectar patrones de ataque comunes en la URL
        $suspiciousPatterns = [
            '../',           // Path traversal
            'etc/passwd',    // Linux password file
            '<script',       // XSS attempt
            'UNION SELECT',  // SQL injection
            'OR 1=1',        // SQL injection
            '${',            // Template injection
            'eval(',         // Code injection
            'base64_decode', // PHP injection
        ];

        $fullUrl = strtolower($request->fullUrl());
        foreach ($suspiciousPatterns as $pattern) {
            if (str_contains($fullUrl, strtolower($pattern))) {
                Log::critical('Attack pattern detected in URL', [
                    'ip' => $ip,
                    'pattern' => $pattern,
                    'url' => $request->fullUrl(),
                ]);

                $this->incrementSuspiciousCounter($ip, 5); // +5 por intento de ataque

                return $this->blockedResponse();
            }
        }

        return $next($request);
    }

    private function blockedResponse(): Response
    {
        return response()->json([
            'message' => 'Acceso denegado.',
        ], 403);
    }

    private function incrementSuspiciousCounter(string $ip, int $amount = 1): void
    {
        $key = "suspicious_activity:{$ip}";
        $count = Cache::get($key, 0) + $amount;
        Cache::put($key, $count, now()->addHours(1));

        // Bloquear automáticamente después de 10 puntos de sospecha
        if ($count >= 10) {
            Cache::put("blocked_ip:{$ip}", true, now()->addHours(24));
            Log::critical('IP auto-blocked', ['ip' => $ip, 'score' => $count]);
        }
    }
}
?>