<?php
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\SocialAuthController;

    /*
    RUTAS WEB
      - Rutas para la interfaz web
      - Principalmente para la vista de bienvenida y callback de autenticación social
    */

    Route::get('/', function () {
        return view('welcome');
    });

    // AUTENTICACIÓN SOCIAL (Web)
    // Estas rutas son necesarias para el flujo de OAuth si se inicia desde navegador
    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);
?>