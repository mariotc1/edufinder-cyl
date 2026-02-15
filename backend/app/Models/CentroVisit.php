<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Centro;
use App\Models\User;

class CentroVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'centro_id',
        'user_id',
        'ip_address',
    ];

    public function centro()
    {
        return $this->belongsTo(Centro::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
