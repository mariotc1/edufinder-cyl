<?php
namespace App\Console\Commands;

use App\Services\OpenDataSyncService;
use Illuminate\Console\Command;

// COMANDO DE SINCRONIZACIÓN
// Ejecuta el proceso de actualización de datos desde el portal de OpenData de la JCyL
class SyncOpenDataCommand extends Command
{

    protected $signature = 'opendata:sync';

    protected $description = 'Synchronize data from OpenData JCyL';

    protected $service;

    public function __construct(OpenDataSyncService $service)
    {
        parent::__construct();
        $this->service = $service;
    }

    // EJECUCIÓN DEL COMANDO
    // Orquesta la sincronización secuencial de Centros y Ciclos
    public function handle()
    {
        $startTime = now();
        $logBuffer = "";

        $syncLog = \App\Models\SyncLog::create([
            'started_at' => $startTime,
            'status' => 'running',
            'log' => "Starting OpenData synchronization...\n",
        ]);

        $logAndInfo = function ($message) use (&$logBuffer, $syncLog) {
            $this->info($message);
            $logBuffer .= "[$message] " . now()->toDateTimeString() . "\n";
            $syncLog->update(['log' => $logBuffer]);
        };

        try {
            $logAndInfo('Starting OpenData synchronization...');

            $logAndInfo('Syncing Centros Docentes...');
            $statsCentros = $this->service->syncCentros();
            $logAndInfo("Centros Docentes synced. Fetched: {$statsCentros['total_fetched']}, Created: {$statsCentros['created']}, Updated: {$statsCentros['updated']}");

            $logAndInfo('Syncing Ciclos FP...');
            $statsCiclos = $this->service->syncCiclos();
            $logAndInfo("Ciclos FP synced. Fetched: {$statsCiclos['total_fetched']}, Created: {$statsCiclos['created']}, Updated: {$statsCiclos['updated']}");

            $logAndInfo('All operations completed.');

            $syncLog->update([
                'ended_at' => now(),
                'status' => 'success',
                'log' => $logBuffer
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            $logBuffer .= "[ERROR] " . $e->getMessage() . "\n";

            $syncLog->update([
                'ended_at' => now(),
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'log' => $logBuffer
            ]);

            return 1;
        }
    }
}
?>