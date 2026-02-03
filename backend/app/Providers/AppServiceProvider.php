<?php
    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Illuminate\Auth\Notifications\ResetPassword;

    class AppServiceProvider extends ServiceProvider {
        
        public function register(): void {
            //
        }

        public function boot(): void {
            if ($this->app->environment('production')) {
                \Illuminate\Support\Facades\URL::forceScheme('https');
            }

            ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
                return config('services.frontend_url', 'http://localhost:3000') . "/reset-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
            });
        }
    }
?>