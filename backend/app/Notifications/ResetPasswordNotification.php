<?php
    namespace App\Notifications;

    use Illuminate\Bus\Queueable;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Notifications\Messages\MailMessage;
    use Illuminate\Auth\Notifications\ResetPassword;

    class ResetPasswordNotification extends ResetPassword implements ShouldQueue {
        use Queueable;

        public function toMail($notifiable): MailMessage {
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