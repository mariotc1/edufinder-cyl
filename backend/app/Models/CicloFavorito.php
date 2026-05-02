<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * MODELO CICLO FAVORITO
 *
 * Representa un ciclo formativo marcado como favorito por un usuario.
 * Permite recomendaciones más precisas basadas en ciclos específicos.
 */
class CicloFavorito extends Model
{
    protected $table = 'ciclo_favoritos';

    protected $fillable = ['user_id', 'ciclo_id'];

    /**
     * Usuario que marcó el ciclo como favorito
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Ciclo marcado como favorito
     */
    public function ciclo()
    {
        return $this->belongsTo(CicloFp::class, 'ciclo_id');
    }
}
