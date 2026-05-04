<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * MODELO DE HISTORIAL DE BÚSQUEDAS
 * Almacena las búsquedas de centros realizadas por los usuarios
 */
class SearchHistory extends Model
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
