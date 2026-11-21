<?php

namespace App\Services;

use App\Models\ExceptionLog;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * EXCEPTION LOG SERVICE
 *
 * Registra las excepciones reales de la aplicación para el panel de Incidencias.
 * Agrupa ocurrencias repetidas del mismo error (misma clase + archivo + línea)
 * bajo una única fila, igual que haría un error tracker real.
 */
class ExceptionLogService
{
    // Excepciones "esperadas" que no representan un fallo real de la app
    private const IGNORED_TYPES = [
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Database\Eloquent\ModelNotFoundException::class,
        \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException::class,
        \Illuminate\Http\Exceptions\ThrottleRequestsException::class,
    ];

    public function record(Throwable $e): void
    {
        foreach (self::IGNORED_TYPES as $ignored) {
            if ($e instanceof $ignored) {
                return;
            }
        }

        try {
            $request = request();
            $fingerprint = md5(get_class($e) . '|' . $e->getFile() . '|' . $e->getLine());

            $existing = ExceptionLog::where('fingerprint', $fingerprint)->first();

            if ($existing) {
                $existing->occurrences += 1;
                $existing->last_seen_at = now();
                $existing->message = $e->getMessage();
                $existing->trace = $e->getTraceAsString();
                if ($existing->status === 'resolved') {
                    $existing->status = 'open'; // regresión: vuelve a ocurrir
                }
                $existing->save();
                return;
            }

            ExceptionLog::create([
                'fingerprint' => $fingerprint,
                'exception_class' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'url' => $request?->fullUrl(),
                'method' => $request?->method(),
                'user_id' => $request?->user()?->id,
                'ip_address' => $request?->ip(),
                'status' => 'open',
                'occurrences' => 1,
                'first_seen_at' => now(),
                'last_seen_at' => now(),
            ]);
        } catch (Throwable $loggingError) {
            Log::error('Failed to record exception log', ['error' => $loggingError->getMessage()]);
        }
    }
}
