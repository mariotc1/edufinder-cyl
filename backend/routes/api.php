<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CentroController;
use App\Http\Controllers\CicloFpController;
use App\Http\Controllers\FavoritoController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/{provider}/redirect', [App\Http\Controllers\SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [App\Http\Controllers\SocialAuthController::class, 'handleProviderCallback']);

Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/debug-queue', function () {
    try {
        $failed = \Illuminate\Support\Facades\DB::table('failed_jobs')->orderByDesc('id')->limit(5)->get();
        $pending = \Illuminate\Support\Facades\DB::table('jobs')->count();
        return response()->json([
            'pending_jobs_count' => $pending,
            'recent_failed_jobs' => $failed,
            'mail_config' => [
                'default' => config('mail.default'), // Should be 'smtp'
                'smtp_host' => config('mail.mailers.smtp.host'), // Should be smtp.resend.com
                'smtp_port' => config('mail.mailers.smtp.port'), // Should be 465 or 587
                'smtp_username' => config('mail.mailers.smtp.username'), // Should be 'resend'
                'from_address' => config('mail.from.address'),
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/centros/sugerencias', [CentroController::class, 'suggestions']);
Route::get('/centros', [CentroController::class, 'index']);
Route::get('/centros/{id}', [CentroController::class, 'show']);
Route::get('/centros/{id}/ciclos', [CentroController::class, 'ciclos']);

Route::get('/busqueda', [App\Http\Controllers\SearchController::class, 'index']);

Route::get('/ciclos/sugerencias', [CicloFpController::class, 'suggestions']);
Route::get('/ciclos', [CicloFpController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'user']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/me/photo', [AuthController::class, 'updateProfilePhoto']);
    Route::delete('/me/photo', [AuthController::class, 'deleteProfilePhoto']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);

    Route::get('/favoritos', [FavoritoController::class, 'index']);
    Route::post('/favoritos/{id}', [FavoritoController::class, 'store']);
    Route::delete('/favoritos/{id}', [FavoritoController::class, 'destroy']);
});
