<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Two\AbstractProvider;

// CONTROLADOR DE AUTENTICACIÓN SOCIAL
// Maneja la lógica común para proveedores OAuth (Google y GitHub) usando Socialite
class SocialAuthController extends Controller
{

    // REDIRIGIR AL PROVEEDOR
    // Inicia el flujo OAuth redirigiendo al usuario a la página de login del proveedor
    public function redirectToProvider($provider)
    {
        $driver = Socialite::driver($provider);

        if ($driver instanceof AbstractProvider) {
            $driver->stateless();
        }

        return $driver->redirect();
    }

    // CALLBACK DEL PROVEEDOR
    // Recibe la respuesta del proveedor, busca o crea el usuario y genera el token
    public function handleProviderCallback($provider)
    {
        try {
            $driver = Socialite::driver($provider);

            if ($driver instanceof AbstractProvider) {
                $driver->stateless();
            }

            $socialUser = $driver->user();

        } catch (\Exception $e) {
            Log::error("Social Login Error ($provider): " . $e->getMessage());
            return redirect(env('FRONTEND_URL') . '/login?error=social_login_failed');
        }

        $email = $socialUser->getEmail();

        if (empty($email)) {
            $email = "{$provider}_{$socialUser->getId()}@no-email.edufinder.com";
        }

        $user = User::where($provider . '_id', $socialUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $email)->first();

            if ($user) {
                $user->update([
                    $provider . '_id' => $socialUser->getId(),
                ]);

            } else {
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $email,
                    'password' => Hash::make(uniqid()),
                    $provider . '_id' => $socialUser->getId(),
                    'email_verified_at' => now(),
                ]);

                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'REGISTER_SOCIAL',
                    'description' => "User registered via {$provider}",
                    'ip_address' => request()->ip(),
                ]);
            }
        }

        // CHECK BLOCKED STATUS
        if ($user->is_blocked) {
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'LOGIN_FAILED_BLOCKED',
                'description' => "Blocked user attempted to login via {$provider}",
                'ip_address' => request()->ip(),
            ]);

            return redirect(env('FRONTEND_URL') . '/login?error=account_blocked');
        }

        // UPDATE LAST LOGIN
        $user->last_login_at = now();
        $user->save();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'LOGIN_SOCIAL',
            'description' => "User logged in via {$provider}",
            'ip_address' => request()->ip(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        return redirect("$frontendUrl/auth/callback?token=$token&user_id=$user->id");
    }
}
?>