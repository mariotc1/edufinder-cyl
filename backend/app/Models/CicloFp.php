<?php
    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;

    // MODELO DE CICLO FORMATIVO
    // Representa un estudio de FP (grado medio, superior etc.) impartido en un centro
    class CicloFp extends Model {
        use HasFactory;

        protected $table = 'ciclos_fp';

        protected $fillable = [
            'centro_id',
            'familia_profesional',
            'codigo_familia',
            'nivel_educativo',
            'clave_ciclo',
            'ciclo_formativo',
            'modalidad',
            'tipo_ensenanza',
            'data_hash',
        ];

        // RELACIÓN: CENTRO
        // Cada ciclo pertenece a un único centro educativo
        public function centro() {
            return $this->belongsTo(Centro::class);
        }
    }
?>