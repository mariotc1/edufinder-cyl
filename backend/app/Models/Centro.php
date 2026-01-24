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
    ];

    public function ciclos()
    {
        return $this->hasMany(CicloFp::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favoritos', 'centro_id', 'user_id');
    }
}
