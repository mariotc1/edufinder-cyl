<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

// MODELO DE USUARIO
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ATRIBUTOS ASIGNABLES EN MASA
    // Define qué campos pueden ser rellenados mediante create() o update()
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'github_id',
        'foto_perfil',
        'ubicacion_lat',
        'ubicacion_lon',
        'role',
    ];

    // RELACIÓN: FAVORITOS
    // Un usuario puede tener múltiples centros marcados como favoritos
    public function favoritos()
    {
        return $this->hasMany(Favorito::class);
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // NOTIFICACIÓN DE RESETEO DE PASSWORD
    // Sobrescribe el método por defecto para enviar la notificación personalizada
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    // ACCESOR: FOTO DE PERFIL
    // Devuelve la URL completa de la imagen, ya sea local o externa (Cloudinary/Google)
    public function getFotoPerfilAttribute($value)
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL) || str_contains($value, 'http')) {
            return $value;
        }

        return asset('storage/' . $value);
    }

    // HELPER: IS ADMIN
    // Comprueba si el usuario tiene rol de administrador
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
?>