<?php
    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Illuminate\Auth\Notifications\ResetPassword;

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
        }
    }
?>