<?php
    namespace App\Http\Controllers;

    use App\Models\User;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Validation\ValidationException;
    use Illuminate\Support\Facades\Mail;
    use App\Mail\WelcomeEmail;
    use Illuminate\Support\Facades\Password;
    use Illuminate\Auth\Events\PasswordReset;
    use Illuminate\Support\Str;

    class AuthController extends Controller {
        public function register(Request $request) {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            try {
                Mail::to($user)->send(new WelcomeEmail($user));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Error sending welcome email: ' . $e->getMessage());
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ], 201);
        }

        public function login(Request $request) {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Las credenciales proporcionadas son incorrectas.'],
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ]);
        }

        public function logout(Request $request) {
            $request->user()->currentAccessToken()->delete();

            return response()->json(['message' => 'Sesión cerrada correctamente']);
        }

        public function user(Request $request) {
            return response()->json($request->user());
        }

        public function redirectToGoogle() {
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = \Laravel\Socialite\Facades\Socialite::driver('google');

            return $driver->stateless()->redirect();
        }

        public function handleGoogleCallback() {
            try {
                /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
                $driver = \Laravel\Socialite\Facades\Socialite::driver('google');

                $googleUser = $driver->stateless()->user();

                $user = User::where('email', $googleUser->getEmail())->first();

                if ($user) {
                    if (!$user->google_id) {
                        $user->update(['google_id' => $googleUser->getId()]);
                    }

                } else {
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'password' => Hash::make(uniqid()), 
                        'google_id' => $googleUser->getId(),
                        'foto_perfil' => $googleUser->getAvatar(),
                    ]);
                }

                $token = $user->createToken('auth_token')->plainTextToken;

                $frontendUrl = config('services.frontend_url', 'http://localhost:3000');
                return redirect("{$frontendUrl}/auth/callback?token={$token}");

            } catch (\Exception $e) {
                return response()->json(['message' => 'Error al autenticar con Google'], 500);
            }
        }

        public function updateProfile(Request $request) {
            $user = $request->user();

            $request->validate([
                'name' => 'required|string|max:255',
                'ubicacion_lat' => 'nullable|numeric',
                'ubicacion_lon' => 'nullable|numeric',
            ]);

            $user->update($request->only(['name', 'ubicacion_lat', 'ubicacion_lon']));

            return response()->json(['message' => 'Perfil actualizado', 'user' => $user]);
        }

        public function updatePassword(Request $request) {
            $request->validate([
                'current_password' => 'required',
                'password' => 'required|min:8|confirmed',
            ]);

            if (!Hash::check($request->current_password, $request->user()->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['La contraseña actual es incorrecta.'],
                ]);
            }

            $request->user()->update([
                'password' => Hash::make($request->password),
            ]);

            return response()->json(['message' => 'Contraseña actualizada correctamente']);
        }

        public function sendResetLinkEmail(Request $request) {
            $request->validate(['email' => 'required|email']);

            $status = Password::sendResetLink($request->only('email'));

            return response()->json([
                'status' => 'success',
                'message' => 'Si el correo existe, recibirás un enlace de recuperación en breves instantes.'
            ], 200);
        }

        public function resetPassword(Request $request) {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email',
                'password' => 'required|min:8|confirmed',
            ]);

            $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));
                $user->save();
                event(new PasswordReset($user));
            });

            return $status === Password::PASSWORD_RESET
                ? response()->json(['message' => __($status)])
                : response()->json(['email' => [__($status)]], 400);
        }

        public function updateProfilePhoto(Request $request) {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            $user = $request->user();

            if ($request->hasFile('photo')) {
                try {
                    $result = $request->file('photo')->storeOnCloudinary('top_tutors_avatars');
                    $path = $result->getSecurePath();

                    if ($user->foto_perfil && str_contains($user->foto_perfil, 'cloudinary')) {

                    }

                    $user->update(['foto_perfil' => $path]);

                    return response()->json([
                        'message' => 'Foto de perfil actualizada correctamente',
                        'user' => $user
                    ]);

                } catch (\Exception $e) {
                    return response()->json([
                        'message' => 'Error al subir la imagen: ' . $e->getMessage(),
                        'error_details' => $e->getTraceAsString()
                    ], 500);
                }
            }

            return response()->json(['message' => 'No se ha subido ninguna foto'], 400);
        }

        public function deleteProfilePhoto(Request $request) {
            try {
                $user = $request->user();

                $user->update(['foto_perfil' => null]);

                return response()->json([
                    'message' => 'Foto de perfil eliminada correctamente',
                    'user' => $user
                ]);

            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Error al eliminar foto: ' . $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }
        }
    }
?>