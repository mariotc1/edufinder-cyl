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
        $logBuffer = "Starting OpenData synchronization...\n";

        $syncLog = SyncLog::create([
            'started_at' => now(),
            'status' => 'running',
            'log' => $logBuffer,
        ]);

        $appendLog = function (string $message) use (&$logBuffer, $syncLog) {
            $logBuffer .= "[$message] " . now()->toDateTimeString() . "\n";
            $syncLog->update(['log' => $logBuffer]);
        };

        try {
            $appendLog('Syncing Centros Docentes...');
            $statsCentros = $service->syncCentros($syncLog->id);
            $appendLog("Centros Docentes synced. Fetched: {$statsCentros['total_fetched']}, Created: {$statsCentros['created']}, Updated: {$statsCentros['updated']}");

            $appendLog('Syncing Ciclos FP...');
            $statsCiclos = $service->syncCiclos($syncLog->id);
            $appendLog("Ciclos FP synced. Fetched: {$statsCiclos['total_fetched']}, Created: {$statsCiclos['created']}, Updated: {$statsCiclos['updated']}");

            $appendLog('All operations completed.');

            $syncLog->update([
                'ended_at' => now(),
                'status' => 'success',
                'log' => $logBuffer,
            ]);
        } catch (\Throwable $e) {
            Log::error('SyncOpenDataJob failed: ' . $e->getMessage());
            $logBuffer .= "[ERROR] " . $e->getMessage() . "\n";

            $syncLog->update([
                'ended_at' => now(),
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'log' => $logBuffer,
            ]);

            throw $e;
        }
    }
}
