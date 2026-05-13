<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * HONEYPOT PROTECTION MIDDLEWARE
 *
 * Detecta bots mediante campos trampa invisibles que humanos no rellenan.
 * - Si el campo 'website' o 'company_url' tiene valor = bot detectado
 * - Si el tiempo desde carga del formulario es < 2 segundos = bot detectado
 */
class HoneypotProtection
{
    public function handle(Request $request, Closure $next): Response
    {
        // Campos honeypot (deben estar vacíos)
        $honeypotFields = ['website', 'company_url', 'fax_number', 'secondary_email'];

        foreach ($honeypotFields as $field) {
            if ($request->filled($field)) {
                $this->logSuspiciousActivity($request, "Honeypot field '{$field}' was filled");
                $this->incrementSuspiciousCounter($request->ip());

                return response()->json([
                    'message' => 'Ha ocurrido un error. Inténtalo de nuevo.',
                ], 422);
            }
        }

        // Verificar tiempo mínimo de envío (los bots envían instantáneamente)
        $formLoadedAt = $request->input('_form_token');
        if ($formLoadedAt) {
            try {
                $loadedTimestamp = (int) base64_decode($formLoadedAt);
                $elapsedSeconds = time() - $loadedTimestamp;

                // Si el formulario se envió en menos de 2 segundos = sospechoso
                if ($elapsedSeconds < 2) {
                    $this->logSuspiciousActivity($request, "Form submitted too fast ({$elapsedSeconds}s)");
                    $this->incrementSuspiciousCounter($request->ip());

                    return response()->json([
                        'message' => 'Ha ocurrido un error. Inténtalo de nuevo.',
                    ], 422);
                }

                // Si el token tiene más de 1 hora, también es sospechoso (replay attack)
                if ($elapsedSeconds > 3600) {
                    $this->logSuspiciousActivity($request, "Form token expired ({$elapsedSeconds}s old)");

                    return response()->json([
                        'message' => 'El formulario ha expirado. Recarga la página.',
                    ], 422);
                }
            } catch (\Exception $e) {
                // Token inválido, pero no bloqueamos por si es un cliente antiguo
            }
        }

        // Limpiar campos honeypot del request antes de continuar
        $request->request->remove('website');
        $request->request->remove('company_url');
        $request->request->remove('fax_number');
        $request->request->remove('secondary_email');
        $request->request->remove('_form_token');

        return $next($request);
    }

    private function logSuspiciousActivity(Request $request, string $reason): void
    {
        Log::warning('Bot detected', [
            'reason' => $reason,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'payload' => $request->except(['password', 'password_confirmation']),
        ]);
    }

    private function incrementSuspiciousCounter(string $ip): void
    {
        $key = "suspicious_activity:{$ip}";
        $count = Cache::get($key, 0) + 1;
        Cache::put($key, $count, now()->addHours(1));

        // Si hay más de 10 intentos sospechosos en 1 hora, añadir a lista de bloqueo temporal
        if ($count >= 10) {
            Cache::put("blocked_ip:{$ip}", true, now()->addHours(24));
            Log::critical('IP blocked due to suspicious activity', ['ip' => $ip, 'attempts' => $count]);
        }
    }
}
?>