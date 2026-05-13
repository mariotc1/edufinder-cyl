<?php
    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Illuminate\Auth\Notifications\ResetPassword;
    use Illuminate\Cache\RateLimiting\Limit;
    use Illuminate\Support\Facades\RateLimiter;
    use Illuminate\Http\Request;

    // PROVEEDOR DE SERVICIOS PRINCIPAL
    // Configuración global de la aplicación al arrancar
    class AppServiceProvider extends ServiceProvider {

        public function register(): void {
            //
        }

        // BOOTSTRAP DE SERVICIOS
        // Se ejecuta después de que todos los servicios han sido registrados
        public function boot(): void {
            // Forzar HTTPS en producción para asegurar cookies seguras
            if ($this->app->environment('production')) {
                \Illuminate\Support\Facades\URL::forceScheme('https');
            }

            // Personalización de la URL de restablecimiento de contraseña
            // Redirige al frontend en lugar de usar vistas de Blade predeterminadas
            ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
                return config('services.frontend_url', 'http://localhost:3000') . "/reset-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
            });

            // ============================================
            // RATE LIMITING - PROTECCIÓN CONTRA ABUSO
            // ============================================

            // Registro: 5 intentos por minuto por IP (muy restrictivo)
            RateLimiter::for('register', function (Request $request) {
                return Limit::perMinute(5)->by($request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Demasiados intentos de registro. Espera un minuto.',
                        'retry_after' => 60
                    ], 429);
                });
            });

            // Login: 5 intentos por minuto por IP + email combinado
            RateLimiter::for('login', function (Request $request) {
                $key = $request->ip() . '|' . $request->input('email', '');
                return Limit::perMinute(5)->by($key)->response(function () {
                    return response()->json([
                        'message' => 'Demasiados intentos de inicio de sesión. Espera un minuto.',
                        'retry_after' => 60
                    ], 429);
                });
            });

            // Recuperación de contraseña: 3 intentos por minuto (evita spam de emails)
            RateLimiter::for('password-reset', function (Request $request) {
                return Limit::perMinute(3)->by($request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Demasiadas solicitudes de recuperación. Espera un minuto.',
                        'retry_after' => 60
                    ], 429);
                });
            });

            // API general: 60 peticiones por minuto por IP
            RateLimiter::for('api', function (Request $request) {
                return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
            });

            // Búsquedas: 30 por minuto (evita scraping masivo)
            RateLimiter::for('search', function (Request $request) {
                return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Demasiadas búsquedas. Espera un momento.',
                        'retry_after' => 60
                    ], 429);
                });
            });

            // Favoritos: 20 acciones por minuto
            RateLimiter::for('favorites', function (Request $request) {
                return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
            });

            // Subida de archivos: 5 por minuto
            RateLimiter::for('uploads', function (Request $request) {
                return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Demasiadas subidas de archivos. Espera un minuto.',
                        'retry_after' => 60
                    ], 429);
                });
            });

            // Admin: 100 peticiones por minuto (más permisivo pero controlado)
            RateLimiter::for('admin', function (Request $request) {
                return Limit::perMinute(100)->by($request->user()?->id ?: $request->ip());
            });
        }
    }
?>