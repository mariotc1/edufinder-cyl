<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExceptionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'fingerprint',
        'exception_class',
        'message',
        'file',
        'line',
        'trace',
        'url',
        'method',
        'user_id',
        'ip_address',
        'status',
        'occurrences',
        'first_seen_at',
        'last_seen_at',
    ];

    protected $casts = [
        'first_seen_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
