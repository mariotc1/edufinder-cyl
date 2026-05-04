<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * MODELO DE HISTORIAL DE BÚSQUEDAS DE CICLOS FP
 * Almacena las búsquedas de ciclos realizadas por los usuarios
 */
class CycleSearchHistory extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'search_term'];

    /**
     * RELACIÓN: USUARIO
     * Cada historial pertenece a un usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
