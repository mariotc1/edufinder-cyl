<?php
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\SocialAuthController;

    Route::get('/', function () {
        return view('welcome');
    });

    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);
?>