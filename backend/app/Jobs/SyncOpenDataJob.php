<?php

namespace App\Jobs;

use App\Models\SyncLog;
use App\Services\OpenDataSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncOpenDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 1;

    public function handle(OpenDataSyncService $service): void
    {
        $log = SyncLog::create([
            'started_at' => now(),
            'status' => 'running',
            'log' => '',
        ]);

        try {
            $statsCentros = $service->syncCentros();
            $statsCiclos = $service->syncCiclos();

            $log->update([
                'ended_at' => now(),
                'status' => 'success',
                'log' => json_encode([
                    'centros' => $statsCentros,
                    'ciclos' => $statsCiclos,
                ]),
            ]);
        } catch (\Throwable $e) {
            Log::error('SyncOpenDataJob failed: ' . $e->getMessage());

            $log->update([
                'ended_at' => now(),
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
