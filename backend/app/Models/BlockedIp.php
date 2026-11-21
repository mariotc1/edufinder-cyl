<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BlockedIp extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip',
        'reason',
        'blocked_by',
        'blocked_until',
        'admin_id',
    ];

    protected $casts = [
        'blocked_until' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function isActive(): bool
    {
        return $this->blocked_until === null || $this->blocked_until->isFuture();
    }
}
