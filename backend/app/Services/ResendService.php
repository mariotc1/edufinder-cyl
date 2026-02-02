<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResendService
{
    protected $apiKey;
    protected $fromEmail;

    public function __construct()
    {
        // Fallback to MAIL_PASSWORD if RESEND_API_KEY is not set (since user put the key there for SMTP)
        $this->apiKey = env('RESEND_API_KEY') ?? env('MAIL_PASSWORD');
        $this->fromEmail = 'onboarding@resend.dev'; // Force testing domain for reliability
    }

    public function sendWelcomeEmail($toName, $toEmail)
    {
        return $this->send(
            $toEmail,
            'Bienvenido a EduFinder CYL',
            $this->getWelcomeHtml($toName)
        );
    }

    public function sendPasswordReset($toEmail, $token)
    {
        $frontendUrl = config('services.frontend_url', 'http://localhost:3000');
        // Construct the frontend URL explicitly
        $url = "{$frontendUrl}/reset-password?token={$token}&email={$toEmail}";

        return $this->send(
            $toEmail,
            'Restablecer contraseña - EduFinder CYL',
            $this->getResetHtml($url)
        );
    }

    protected function send($to, $subject, $html)
    {
        if (!$this->apiKey) {
            Log::error('Resend API Key missing');
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.resend.com/emails', [
                        'from' => 'EduFinder <' . $this->fromEmail . '>',
                        'to' => [$to],
                        'subject' => $subject,
                        'html' => $html,
                    ]);

            if ($response->successful()) {
                Log::info("Email sent via Resend API to {$to}");
                return true;
            } else {
                Log::error('Resend API Failed: ' . $response->body());
                // Throw exception so AuthController catches it and returns 500, avoiding generic Network Error
                throw new \Exception('Resend API Error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Resend API Exception: ' . $e->getMessage());
            return false;
        }
    }

    protected function getWelcomeHtml($name)
    {
        return $this->getObfuscatedTemplate("¡Bienvenido, {$name}!", "
            <p style='color: #4b5563; font-size: 16px; line-height: 24px;'>Gracias por unirte a <strong>EduFinder CYL</strong>, la plataforma líder para encontrar tu futuro en la Formación Profesional.</p>
            <p style='color: #4b5563; font-size: 16px; line-height: 24px;'>Ya puedes explorar centros, guardar tus favoritos y descubrir todos los ciclos formativos disponibles en Castilla y León.</p>
            <div style='text-align: center; margin: 32px 0;'>
                <a href='" . config('services.frontend_url', 'http://localhost:3000') . "' style='background-color: #223945; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-family: sans-serif;'>Explorar Centros</a>
            </div>
        ");
    }

    protected function getResetHtml($url)
    {
        return $this->getObfuscatedTemplate("Recuperar Contraseña", "
            <p style='color: #4b5563; font-size: 16px; line-height: 24px;'>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en EduFinder.</p>
            <div style='text-align: center; margin: 32px 0;'>
                <a href='{$url}' style='background-color: #223945; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-family: sans-serif; display: inline-block;'>Restablecer Contraseña</a>
            </div>
            <p style='color: #6b7280; font-size: 14px;'>Este enlace caducará en 60 minutos.</p>
            <p style='color: #6b7280; font-size: 14px;'>Si no has solicitado este cambio, puedes ignorar este correo.</p>
        ");
    }

    protected function getObfuscatedTemplate($title, $content)
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
                .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { background-color: #223945; padding: 32px; text-align: center; }
                .logo { color: white; font-size: 24px; font-weight: bold; text-decoration: none; letter-spacing: 1px; }
                .content { padding: 40px; }
                .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; }
            </style>
        </head>
        <body>
            <div style='padding: 40px 0;'>
                <div class='email-container'>
                    <div class='header'>
                        <div class='logo'>EduFinder CYL</div>
                    </div>
                    <div class='content'>
                        <h1 style='color: #111827; font-size: 24px; margin-bottom: 24px; margin-top: 0;'>{$title}</h1>
                        {$content}
                    </div>
                    <div class='footer'>
                        &copy; " . date('Y') . " EduFinder CYL. Todos los derechos reservados.<br>
                        Castilla y León, España
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
