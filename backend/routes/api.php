<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CentroController;
use App\Http\Controllers\CicloFpController;
use App\Http\Controllers\FavoritoController;
use Illuminate\Support\Facades\Route;

/*
RUTAS API
  - Aquí se registran todas las rutas de la API para la aplicación
  - Estas rutas son cargadas por el RouteServiceProvider y asignadas al grupo api
*/

// AUTENTICACIÓN BÁSICA
// Rutas públicas para registro e inicio de sesión de usuarios
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// AUTENTICACIÓN SOCIAL (OAuth)
// Rutas para manejar el inicio de sesión con proveedores externos (Google, etc.)
Route::get('/auth/{provider}/redirect', [App\Http\Controllers\SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [App\Http\Controllers\SocialAuthController::class, 'handleProviderCallback']);

// RECUPERACIÓN DE CONTRASEÑA
// Endpoints para solicitar el enlace de reseteo y establecer una nueva contraseña.
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// UTILIDADES Y DEPURACIÓN
// Ruta temporal para verificar el estado de la cola de trabajos y configuración de correo.
Route::get('/debug-queue', function () {
    try {
        $failed = \Illuminate\Support\Facades\DB::table('failed_jobs')->orderByDesc('id')->limit(5)->get();
        $pending = \Illuminate\Support\Facades\DB::table('jobs')->count();
        return response()->json([
            'pending_jobs_count' => $pending,
            'recent_failed_jobs' => $failed,
            'mail_config' => [
                'default' => config('mail.default'),
                'smtp_host' => config('mail.mailers.smtp.host'),
                'smtp_port' => config('mail.mailers.smtp.port'),
                'smtp_username' => config('mail.mailers.smtp.username'),
                'from_address' => config('mail.from.address'),
            ]
        ]);

    } catch (\Throwable $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// GESTIÓN DE CENTROS EDUCATIVOS
// Rutas públicas para consultar información sobre centros y sus ciclos formativos
Route::get('/centros/sugerencias', [CentroController::class, 'suggestions']);
Route::get('/centros', [CentroController::class, 'index']);
Route::get('/centros/{id}', [CentroController::class, 'show']);
Route::get('/centros/{id}/ciclos', [CentroController::class, 'ciclos']);

// BÚSQUEDA GENERAL
// Endpoint para realizar búsquedas globales en la plataforma
Route::get('/busqueda', [App\Http\Controllers\SearchController::class, 'index']);

// GESTIÓN DE CICLOS FORMATIVOS
// Rutas para listar y obtener sugerencias de ciclos de FP
Route::get('/ciclos/sugerencias', [CicloFpController::class, 'suggestions']);
Route::get('/ciclos', [CicloFpController::class, 'index']);

// RUTAS PROTEGIDAS
// Todas las rutas dentro de este grupo requieren un token válido (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Cerrar sesión (invalida el token actual)
    Route::post('/logout', [AuthController::class, 'logout']);

    // PERFIL DE USUARIO
    // Rutas para ver y editar la información del perfil del usuario autenticado
    Route::get('/me', [AuthController::class, 'user']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/me/photo', [AuthController::class, 'updateProfilePhoto']);
    Route::delete('/me/photo', [AuthController::class, 'deleteProfilePhoto']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);

    // SISTEMA DE FAVORITOS
    // Gestión de los centros guardados como favoritos por el usuario
    Route::get('/favoritos', [FavoritoController::class, 'index']);
    Route::post('/favoritos/{id}', [FavoritoController::class, 'store']);
    Route::delete('/favoritos/{id}', [FavoritoController::class, 'destroy']);
});

// PANEL DE ADMINISTRACIÓN
// Rutas protegidas exclusivamente para administradores
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [App\Http\Controllers\AdminController::class, 'stats']);
    Route::get('/users', [App\Http\Controllers\AdminController::class, 'index']);
    Route::put('/users/{id}/role', [App\Http\Controllers\AdminController::class, 'updateRole']);
    Route::delete('/users/{id}', [App\Http\Controllers\AdminController::class, 'destroy']);
    Route::get('/centros', [App\Http\Controllers\AdminController::class, 'getCentros']);
    Route::delete('/centros/{id}', [App\Http\Controllers\AdminController::class, 'destroyCentro']);
});
?>