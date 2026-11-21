<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncChange extends Model
{
    protected $fillable = [
        'sync_log_id',
        'dataset',
        'entity_label',
        'change_type',
        'changes',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function syncLog()
    {
        return $this->belongsTo(SyncLog::class);
    }
}
