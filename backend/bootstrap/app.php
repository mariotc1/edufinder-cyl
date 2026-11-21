<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API pura: no hay ninguna ruta 'login' basada en sesión/vista. El valor por
        // defecto de Laravel (redirectGuestsTo(fn () => route('login'))) revienta con
        // un 500 (RouteNotFoundException) en cuanto una petición sin autenticar no
        // envía "Accept: application/json" (bots, curl, clientes externos de la API
        // abierta). Lo sustituimos por "sin redirección" para que siempre se resuelva
        // a una respuesta 401 JSON limpia.
        $middleware->redirectGuestsTo(fn () => null);

        // Confiar en el proxy de Render (solo el salto inmediato) para obtener la IP real
        // del cliente desde X-Forwarded-For. Sin esto, $request->ip() devuelve la IP del
        // proxy y el rate limiting / bloqueo de IPs afectaría a todos los usuarios a la vez.
        // Las entradas de X-Forwarded-For añadidas por el cliente no se tienen en cuenta.
        $middleware->trustProxies(at: '*');

        // Alias de middlewares personalizados
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'honeypot' => \App\Http\Middleware\HoneypotProtection::class,
            'block.suspicious' => \App\Http\Middleware\BlockSuspiciousIPs::class,
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
        ]);

        // Aplicar headers de seguridad y bloqueo de IPs a TODAS las peticiones API
        $middleware->api(prepend: [
            \App\Http\Middleware\BlockSuspiciousIPs::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->preventRequestsDuringMaintenance(except: [
            '/api/admin/*',
            '/admin/*', // Just in case
            '/up', // Health check
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (\Throwable $e): void {
            app(\App\Services\ExceptionLogService::class)->record($e);
        });

        // Esta es una API pura (sin rutas 'login' basadas en sesión), así que una
        // petición sin autenticar siempre debe recibir JSON 401, nunca un intento
        // de redirect()->guest(route('login')) que no existe y rompe con un 500.
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            return response()->json(['message' => 'No autenticado.'], 401);
        });
    })->create();
