<?php
    namespace App\Models;

    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable {

        protected $fillable = [
            'name',
            'email',
            'password',
            'google_id',
            'github_id',
            'foto_perfil',
            'ubicacion_lat',
            'ubicacion_lon',
        ];

        public function favoritos() {
            return $this->hasMany(Favorito::class);
        }

        protected $hidden = [
            'password',
            'remember_token',
        ];

        protected function casts(): array {
            return [
                'email_verified_at' => 'datetime',
                'password' => 'hashed',
            ];
        }
        
        public function sendPasswordResetNotification($token) {
            $this->notify(new \App\Notifications\ResetPasswordNotification($token));
        }
        
        public function getFotoPerfilAttribute($value) {
            if (!$value) {
                return null;
            }

            if (filter_var($value, FILTER_VALIDATE_URL) || str_contains($value, 'http')) {
                return $value;
            }

            return asset('storage/' . $value);
        }
    }
?>