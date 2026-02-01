<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CicloFp extends Model
{
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

    public function centro()
    {
        return $this->belongsTo(Centro::class);
    }
}
