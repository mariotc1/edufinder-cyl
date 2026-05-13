<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CentroController;
use App\Http\Controllers\CicloFpController;
use App\Http\Controllers\CicloFavoritoController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\SavedSearchController;
use App\Http\Controllers\SearchHistoryController;
use App\Http\Controllers\CycleSearchHistoryController;
use Illuminate\Support\Facades\Route;

/*
RUTAS API
  - Aquí se registran todas las rutas de la API para la aplicación
  - Estas rutas son cargadas por el RouteServiceProvider y asignadas al grupo api
*/

// ============================================
// AUTENTICACIÓN BÁSICA (PROTEGIDA)
// Rate limiting + Honeypot para prevenir bots y ataques de fuerza bruta
// ============================================
Route::middleware(['throttle:register', 'honeypot'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware(['throttle:login'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// AUTENTICACIÓN SOCIAL (OAuth)
// Rutas para manejar el inicio de sesión con proveedores externos (Google, etc.)
Route::get('/auth/{provider}/redirect', [App\Http\Controllers\SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [App\Http\Controllers\SocialAuthController::class, 'handleProviderCallback']);

// RECUPERACIÓN DE CONTRASEÑA (con rate limiting estricto para evitar spam de emails)
Route::middleware(['throttle:password-reset'])->group(function () {
    Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

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


// ============================================
// GESTIÓN DE CENTROS EDUCATIVOS
// Rate limiting para prevenir scraping masivo
// ============================================
Route::middleware(['throttle:search'])->group(function () {
    Route::get('/centros/sugerencias', [CentroController::class, 'suggestions']);
    Route::get('/centros', [CentroController::class, 'index']);
    Route::get('/centros/{id}', [CentroController::class, 'show']);
    Route::get('/centros/{id}/ciclos', [CentroController::class, 'ciclos']);

    // BÚSQUEDA GENERAL
    Route::get('/busqueda', [App\Http\Controllers\SearchController::class, 'index']);

    // RECOMENDACIONES IA
    Route::get('/recommendations/wizard', [RecommendationController::class, 'fromWizard']);

    // GESTIÓN DE CICLOS FORMATIVOS
    Route::get('/ciclos/sugerencias', [CicloFpController::class, 'suggestions']);
    Route::get('/ciclos', [CicloFpController::class, 'index']);
});

// ============================================
// RUTAS PROTEGIDAS
// Todas las rutas dentro de este grupo requieren un token válido (Sanctum)
// ============================================
Route::middleware('auth:sanctum')->group(function () {
    // Cerrar sesión (invalida el token actual)
    Route::post('/logout', [AuthController::class, 'logout']);

    // PERFIL DE USUARIO
    Route::get('/me', [AuthController::class, 'user']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);

    // Subida de fotos con rate limiting específico (5/min)
    Route::middleware(['throttle:uploads'])->group(function () {
        Route::post('/me/photo', [AuthController::class, 'updateProfilePhoto']);
    });
    Route::delete('/me/photo', [AuthController::class, 'deleteProfilePhoto']);

    // SISTEMA DE FAVORITOS (con rate limiting para evitar spam)
    Route::middleware(['throttle:favorites'])->group(function () {
        // Favoritos de centros
        Route::get('/favoritos', [FavoritoController::class, 'index']);
        Route::post('/favoritos/{id}', [FavoritoController::class, 'store']);
        Route::delete('/favoritos/{id}', [FavoritoController::class, 'destroy']);

        // Favoritos de ciclos
        Route::get('/ciclos-favoritos', [CicloFavoritoController::class, 'index']);
        Route::get('/ciclos-favoritos/ids', [CicloFavoritoController::class, 'ids']);
        Route::get('/ciclos-favoritos/centro/{centroId}', [CicloFavoritoController::class, 'byCentro']);
        Route::post('/ciclos-favoritos/{cicloId}/toggle', [CicloFavoritoController::class, 'toggle']);
        Route::get('/ciclos-favoritos/{cicloId}/check', [CicloFavoritoController::class, 'check']);
    });

    // RECOMENDACIONES PERSONALIZADAS
    Route::get('/recommendations/favorites', [RecommendationController::class, 'fromFavorites']);

    // BÚSQUEDAS GUARDADAS
    Route::get('/saved-searches', [SavedSearchController::class, 'index']);
    Route::post('/saved-searches', [SavedSearchController::class, 'store']);
    Route::put('/saved-searches/{id}', [SavedSearchController::class, 'update']);
    Route::delete('/saved-searches/{id}', [SavedSearchController::class, 'destroy']);

    // HISTORIAL DE BÚSQUEDAS DE CENTROS
    Route::get('/search-history', [SearchHistoryController::class, 'index']);
    Route::post('/search-history', [SearchHistoryController::class, 'store']);
    Route::post('/search-history/sync', [SearchHistoryController::class, 'sync']);
    Route::delete('/search-history/{id}', [SearchHistoryController::class, 'destroy']);
    Route::delete('/search-history', [SearchHistoryController::class, 'clear']);

    // HISTORIAL DE BÚSQUEDAS DE CICLOS FP
    Route::get('/cycle-search-history', [CycleSearchHistoryController::class, 'index']);
    Route::post('/cycle-search-history', [CycleSearchHistoryController::class, 'store']);
    Route::post('/cycle-search-history/sync', [CycleSearchHistoryController::class, 'sync']);
    Route::delete('/cycle-search-history/{id}', [CycleSearchHistoryController::class, 'destroy']);
    Route::delete('/cycle-search-history', [CycleSearchHistoryController::class, 'clear']);

    // HISTORIAL DE CENTROS VISITADOS
    Route::get('/visited-centers', [CentroController::class, 'visitedCenters']);
    Route::delete('/visited-centers/{centroId}', [CentroController::class, 'removeVisitedCenter']);
    Route::delete('/visited-centers', [CentroController::class, 'clearVisitedCenters']);
});

// ============================================
// PANEL DE ADMINISTRACIÓN
// Rutas protegidas exclusivamente para administradores
// Rate limiting específico para admin (100/min)
// ============================================
Route::middleware(['auth:sanctum', 'admin', 'throttle:admin'])->prefix('admin')->group(function () {
    // Basic CRUD (Legacy/Existing)
    Route::get('/users', [App\Http\Controllers\AdminController::class, 'index']);
    Route::put('/users/{id}/role', [App\Http\Controllers\AdminController::class, 'updateRole']);
    Route::delete('/users/{id}', [App\Http\Controllers\AdminController::class, 'destroy']);
    Route::get('/centros', [App\Http\Controllers\AdminController::class, 'getCentros']);
    Route::delete('/centros/{id}', [App\Http\Controllers\AdminController::class, 'destroyCentro']);

    // User Management Extended
    Route::put('/users/{id}/block', [App\Http\Controllers\AdminController::class, 'toggleBlock']);
    Route::post('/users/{id}/reset-password', [App\Http\Controllers\AdminController::class, 'resetUserPassword']);
    Route::get('/users/{id}/details', [App\Http\Controllers\AdminController::class, 'getUserDetails']);

    // Dashboard & Stats
    Route::get('/dashboard/stats', [App\Http\Controllers\AdminDashboardController::class, 'getStats']); // Enhanced stats
    Route::get('/dashboard/activity', [App\Http\Controllers\AdminDashboardController::class, 'getRecentActivity']);
    Route::get('/dashboard/sync-status', [App\Http\Controllers\AdminDashboardController::class, 'getSyncStatus']);
    Route::post('/dashboard/force-sync', [App\Http\Controllers\AdminDashboardController::class, 'forceSync']);

    // System Configuration
    Route::get('/system/status', [App\Http\Controllers\AdminSystemController::class, 'getSystemStatus']);
    Route::post('/system/clear-cache', [App\Http\Controllers\AdminSystemController::class, 'clearCache']);
    Route::post('/system/maintenance', [App\Http\Controllers\AdminSystemController::class, 'toggleMaintenance']);
    Route::post('/system/clear-failed-jobs', [App\Http\Controllers\AdminSystemController::class, 'clearFailedJobs']);
    Route::get('/system/logs', [App\Http\Controllers\AdminSystemController::class, 'getLogs']);

    // Legacy route kept for backward compatibility if needed, but overridden by enhanced stats above if called specifically
    Route::get('/stats', [App\Http\Controllers\AdminController::class, 'stats']);
});
?>