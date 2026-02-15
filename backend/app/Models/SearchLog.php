<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'query',
        'user_id',
        'results_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
