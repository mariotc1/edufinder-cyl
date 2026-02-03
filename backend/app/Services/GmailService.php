<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Illuminate\Support\Facades\Log;

class GmailService
{
    public function sendWelcomeEmail($toEmail, $toName)
    {
        $subject = 'Bienvenido a EduFinder CYL';
        $body = "
            <h1>¡Bienvenido a EduFinder CYL, {$toName}!</h1>
            <p>Gracias por registrarte en la plataforma líder para encontrar Formación Profesional en Castilla y León.</p>
            <p>Ya puedes explorar centros, guardar favoritos y planificar tu futuro.</p>
            <br>
            <p>Atentamente,<br>El equipo de EduFinder</p>
        ";

        return $this->send($toEmail, $toName, $subject, $body);
    }

    public function sendPasswordReset($toEmail, $token)
    {
        $frontendUrl = config('services.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $url = "{$frontendUrl}/reset-password?token={$token}&email={$toEmail}";

        $subject = 'Restablecer contraseña - EduFinder CYL';
        $body = "
            <h1>Recuperación de Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href='{$url}' style='padding: 10px 20px; background-color: #223945; color: white; text-decoration: none; border-radius: 5px;'>Restablecer Contraseña</a>
            <p>Si no has sido tú, ignora este mensaje.</p>
            <p>Este enlace caduca en 60 minutos.</p>
        ";

        return $this->send($toEmail, '', $subject, $body);
    }

    protected function send($toEmail, $toName, $subject, $body)
    {
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST', 'smtp.gmail.com');
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME'); // mariotomecore@gmail.com
            $mail->Password = env('MAIL_PASSWORD'); // Google App Password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Use STARTTLS
            $mail->Port = env('MAIL_PORT', 587); // Use Port 587

            // Recipients
            $mail->setFrom(env('MAIL_FROM_ADDRESS', 'mariotomecore@gmail.com'), 'EduFinder CYL');
            $mail->addAddress($toEmail, $toName);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AltBody = strip_tags($body);

            $mail->send();
            Log::info("Email sent via PHPMailer to {$toEmail}");
            return true;
        } catch (Exception $e) {
            Log::error("PHPMailer Error: {$mail->ErrorInfo}");
            // Throw exception so controller knows it failed
            throw new \Exception("Error enviando email: " . $mail->ErrorInfo);
        }
    }
}
