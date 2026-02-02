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
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Resend API Exception: ' . $e->getMessage());
            return false;
        }
    }

    protected function getWelcomeHtml($name)
    {
        return "
            <h1>¡Bienvenido a EduFinder CYL, {$name}!</h1>
            <p>Gracias por registrarte en la plataforma líder para encontrar Formación Profesional en Castilla y León.</p>
            <p>Ya puedes explorar centros, guardar favoritos y planificar su futuro.</p>
            <br>
            <p>Atentamente,<br>El equipo de EduFinder</p>
        ";
    }

    protected function getResetHtml($url)
    {
        return "
            <h1>Recuperación de Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href='{$url}' style='padding: 10px 20px; background-color: #223945; color: white; text-decoration: none; border-radius: 5px;'>Restablecer Contraseña</a>
            <p>Si no has sido tú, ignora este mensaje.</p>
            <p>Este enlace caduca en 60 minutos.</p>
        ";
    }
}
