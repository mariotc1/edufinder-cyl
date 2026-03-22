<?php
    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;

    // MODELO DE BÚSQUEDA GUARDADA
    // Permite a los usuarios guardar combinaciones de filtros de búsqueda
    class SavedSearch extends Model {
        use HasFactory;

        protected $fillable = ['user_id', 'name', 'filters'];

        protected $casts = [
            'filters' => 'array',
        ];

        // RELACIÓN: USUARIO
        public function user() {
            return $this->belongsTo(User::class);
        }
    }
?>
