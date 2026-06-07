<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// MODELO: RESULTADO DEL TEST DE ORIENTACIÓN FP
// Un registro por usuario — updateOrCreate al guardar
class FpQuizResult extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'result', 'completed_at'];

    protected $casts = [
        'result' => 'array',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
