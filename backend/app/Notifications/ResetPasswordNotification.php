<?php
    namespace App\Notifications;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Messages\MailMessage;
    use Illuminate\Auth\Notifications\ResetPassword;

    // NOTIFICACIÓN DE RESTABLECIMIENTO DE CONTRASEÑA
    // Se envía cuando el usuario solicita recuperar su acceso
    class ResetPasswordNotification extends ResetPassword implements ShouldQueue {
        use Queueable;

        // GENERACIÓN DEL CORREO
        // Construye el email con el enlace seguro al frontend para cambiar la contraseña
        public function toMail($notifiable): MailMessage {
            // Obtiene la URL del frontend desde variables de entorno
            $frontendUrl = config('services.frontend_url', 'http://localhost:3000');
            $url = $frontendUrl . "/reset-password?token={$this->token}&email={$notifiable->getEmailForPasswordReset()}";

            return (new MailMessage)
                ->subject('Restablecer contraseña - EduFinder CYL')
                ->greeting('¡Hola!')
                ->line('Recibiste este correo porque solicitaste restablecer la contraseña de tu cuenta.')
                ->action('Restablecer Contraseña', $url)
                ->line('Este enlace de restablecimiento expirará en 60 minutos.')
                ->line('Si no solicitaste un restablecimiento de contraseña, no es necesario realizar ninguna acción.')
                ->salutation('Saludos, el equipo de EduFinder CYL');
        }
    }
?>