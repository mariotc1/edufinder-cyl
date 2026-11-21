<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataSyncState extends Model
{
    protected $fillable = [
        'dataset',
        'last_sync_at',
        'status',
        'records_processed',
        'records_created',
        'records_updated',
        'error_message',
    ];

    protected $casts = [
        'last_sync_at' => 'datetime',
    ];
}
