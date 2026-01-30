<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Two\AbstractProvider;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirectToProvider($provider)
    {
        $driver = Socialite::driver($provider);

        if ($driver instanceof AbstractProvider) {
            $driver->stateless();
        }

        return $driver->redirect();
    }

    /**
     * Obtain the user information from the provider.
     */
    public function handleProviderCallback($provider)
    {
        try {
            // Stateless is crucial for API-driven logic (no session)
            $driver = Socialite::driver($provider);

            if ($driver instanceof AbstractProvider) {
                $driver->stateless();
            }

            $socialUser = $driver->user();
        } catch (\Exception $e) {
            Log::error("Social Login Error ($provider): " . $e->getMessage());
            return redirect(env('FRONTEND_URL') . '/login?error=social_login_failed');
        }

        // Logic:
        // 1. Check if user exists by Provider ID
        // 2. If not, check by email (link account)
        // 3. If not, create new user

        $email = $socialUser->getEmail();

        // Handle missing email (common in GitHub if private)
        if (empty($email)) {
            $email = "{$provider}_{$socialUser->getId()}@no-email.edufinder.com";
        }

        $user = User::where($provider . '_id', $socialUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $email)->first();

            if ($user) {
                // Link existing account
                $user->update([
                    $provider . '_id' => $socialUser->getId(),
                    // Optionally update avatar if missing
                    // 'foto_perfil' => $user->foto_perfil ?? $socialUser->getAvatar()
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(), // GitHub sometimes uses nickname
                    'email' => $email,
                    'password' => Hash::make(uniqid()), // Random password
                    $provider . '_id' => $socialUser->getId(),
                    // 'foto_perfil' => $socialUser->getAvatar(), // Disabled by user request (avoid broken/ugly images)
                    'email_verified_at' => now(),
                ]);
            }
        }

        // Generate Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirect to Frontend Callback with Token
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        return redirect("$frontendUrl/auth/callback?token=$token&user_id=$user->id");
    }
}
