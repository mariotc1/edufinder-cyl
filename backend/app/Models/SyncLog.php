<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SyncLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'started_at',
        'ended_at',
        'status',
        'log',
        'error_message',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];
}
