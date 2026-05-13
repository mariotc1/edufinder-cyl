<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SECURITY HEADERS MIDDLEWARE
 *
 * Añade headers HTTP de seguridad a todas las respuestas.
 * Protege contra XSS, clickjacking, sniffing de contenido, etc.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevenir que el navegador haga MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Protección contra XSS (legacy, pero aún útil)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Prevenir que la página sea embebida en iframes (anti-clickjacking)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Controlar qué información del referrer se envía
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permisos de features del navegador
        $response->headers->set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');

        // Forzar HTTPS en producción
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Eliminar header que expone información del servidor
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
?>