<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Centro extends Model
{
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

    public function ciclos()
    {
        return $this->hasMany(CicloFp::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favoritos', 'centro_id', 'user_id');
    }

    /**
     * Scope para filtrar por cercanía (Haversine Formula)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param float $lat
     * @param float $lng
     * @param int $km Radio en kilómetros
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCercanos($query, $lat, $lng, $km)
    {
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

        // Bindings para selectRaw (3) y whereRaw (3 + 1 para distancia)
        return $query->selectRaw("*, {$haversine} AS distancia", [$lat, $lng, $lat])
            ->whereRaw("{$haversine} < ?", [$lat, $lng, $lat, $km])
            ->orderBy('distancia');
    }
}
