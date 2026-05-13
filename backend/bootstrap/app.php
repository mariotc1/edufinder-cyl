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
        //
    })->create();
