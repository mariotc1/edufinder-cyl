<?php
    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;

    // MODELO DE FAVORITO
    // Tabla que vincula usuarios con centros educativos guardados
    class Favorito extends Model {
        use HasFactory;

        protected $fillable = ['user_id', 'centro_id'];

        // RELACIÓN: USUARIO
        public function user() {
            return $this->belongsTo(User::class);
        }

        // RELACIÓN: CENTRO
        public function centro() {
            return $this->belongsTo(Centro::class);
        }
    }
?>