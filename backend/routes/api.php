<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CentroController;
use App\Http\Controllers\CicloFpController;
use App\Http\Controllers\FavoritoController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/centros', [CentroController::class, 'index']);
Route::get('/centros/{id}', [CentroController::class, 'show']);
Route::get('/centros/{id}/ciclos', [CentroController::class, 'ciclos']);

Route::get('/busqueda', [App\Http\Controllers\SearchController::class, 'index']);

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
