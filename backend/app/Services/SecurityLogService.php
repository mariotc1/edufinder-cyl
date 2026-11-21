<?php
namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\ActivityLog;
use App\Models\BlockedIp;

/**
 * SECURITY LOG SERVICE
 *
 * Servicio centralizado para registrar y analizar actividades sospechosas.
 */
class SecurityLogService
{
    // Tipos de eventos de seguridad
    const EVENT_BOT_DETECTED = 'BOT_DETECTED';
    const EVENT_RATE_LIMIT_HIT = 'RATE_LIMIT_HIT';
    const EVENT_ATTACK_PATTERN = 'ATTACK_PATTERN';
    const EVENT_DISPOSABLE_EMAIL = 'DISPOSABLE_EMAIL';
    const EVENT_BRUTE_FORCE = 'BRUTE_FORCE';
    const EVENT_IP_BLOCKED = 'IP_BLOCKED';
    const EVENT_SUSPICIOUS_REGISTRATION = 'SUSPICIOUS_REGISTRATION';

    /**
     * Registrar evento de seguridad
     */
    public static function log(
        string $event,
        Request $request,
        string $description,
        array $metadata = []
    ): void {
        $data = [
            'event' => $event,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'description' => $description,
            'metadata' => $metadata,
            'timestamp' => now()->toIso8601String(),
        ];

        // Log a archivo
        Log::channel('security')->warning($description, $data);

        // También guardar en base de datos para el panel admin
        try {
            ActivityLog::create([
                'user_id' => $request->user()?->id,
                'action' => "SECURITY_{$event}",
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save security log to database', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Verificar si una IP está bloqueada (BlockedIp en BD, con caché de 60s)
     */
    public static function isIpBlocked(string $ip): bool
    {
        return (bool) Cache::remember("blocked_ip:{$ip}", 60, function () use ($ip) {
            $blocked = BlockedIp::where('ip', $ip)->first();
            if (!$blocked) {
                return false;
            }
            if ($blocked->blocked_until !== null && $blocked->blocked_until->isPast()) {
                $blocked->delete();
                return false;
            }
            return true;
        });
    }

    /**
     * Bloquear una IP temporalmente (o permanentemente si $hours es null)
     */
    public static function blockIp(string $ip, ?int $hours = 24, string $reason = 'Actividad sospechosa automática', string $blockedBy = 'system', ?int $adminId = null): void
    {
        BlockedIp::updateOrCreate(
            ['ip' => $ip],
            [
                'reason' => $reason,
                'blocked_by' => $blockedBy,
                'blocked_until' => $hours !== null ? now()->addHours($hours) : null,
                'admin_id' => $adminId,
            ]
        );
        Cache::forget("blocked_ip:{$ip}");
        Log::critical($hours ? "IP blocked for {$hours} hours" : 'IP blocked permanently', ['ip' => $ip]);
    }

    /**
     * Desbloquear una IP
     */
    public static function unblockIp(string $ip): void
    {
        BlockedIp::where('ip', $ip)->delete();
        Cache::forget("blocked_ip:{$ip}");
        Cache::forget("suspicious_activity:{$ip}");
        Log::info('IP unblocked', ['ip' => $ip]);
    }

    /**
     * Incrementar contador de actividad sospechosa
     */
    public static function incrementSuspiciousCounter(string $ip, int $amount = 1): int
    {
        $key = "suspicious_activity:{$ip}";
        $count = Cache::get($key, 0) + $amount;
        Cache::put($key, $count, now()->addHours(1));

        // Auto-bloquear si supera el umbral
        if ($count >= 10) {
            self::blockIp($ip);
        }

        return $count;
    }

    /**
     * Obtener estadísticas de seguridad recientes
     */
    public static function getStats(): array
    {
        return [
            'blocked_attempts_today' => ActivityLog::where('action', 'like', 'SECURITY_%')
                ->whereDate('created_at', today())
                ->count(),
            'unique_ips_blocked' => BlockedIp::where(function ($q) {
                $q->whereNull('blocked_until')->orWhere('blocked_until', '>', now());
            })->count(),
        ];
    }
}
?>