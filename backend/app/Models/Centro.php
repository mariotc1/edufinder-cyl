<?php
    namespace App\Models;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;

    // MODELO DE CENTRO EDUCATIVO
    // Representa un centro (instituto, colegio) y su información de ubicación y contacto
    class Centro extends Model {

        use HasFactory;

        protected $fillable = [
            'codigo',
            'nombre',
            'naturaleza',
            'denominacion_generica',
            'provincia',
            'municipio',
            'localidad',
            'telefono',
            'email',
            'web',
            'codigo_postal',
            'direccion',
            'latitud',
            'longitud',
            'data_hash',
        ];

        // RELACIÓN: CICLOS FORMATIVOS
        // Un centro puede impartir múltiples ciclos de FP
        public function ciclos() {
            return $this->hasMany(CicloFp::class);
        }

        // RELACIÓN: USUARIOS QUE LO TIENEN COMO FAVORITO
        // Relación muchos a muchos con usuarios a través de la tabla favoritos
        public function favoritedBy() {
            return $this->belongsToMany(User::class, 'favoritos', 'centro_id', 'user_id');
        }

        // SCOPE: BÚSQUEDA POR PROXIMIDAD
        // Permite filtrar centros por distancia usando coordenadas (lat, lng) y radio en km
        public function scopeCercanos($query, $lat, $lng, $km) {
            $haversine = "(
                    6371 * acos(
                        least(1.0, greatest(-1.0, 
                            cos(radians(?))
                            * cos(radians(latitud))
                            * cos(radians(longitud) - radians(?))
                            + sin(radians(?))
                            * sin(radians(latitud))
                        ))
                    )
                )";

            return $query->selectRaw("*, {$haversine} AS distancia", [$lat, $lng, $lat])
                ->whereRaw("{$haversine} < ?", [$lat, $lng, $lat, $km])
                ->orderBy('distancia');
        }
    }
?>