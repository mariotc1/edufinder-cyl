<?php

namespace App\Console\Commands;

use App\Services\OpenDataSyncService;
use Illuminate\Console\Command;

class SyncOpenDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'opendata:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize data from OpenData JCyL';

    protected $service;

    public function __construct(OpenDataSyncService $service)
    {
        parent::__construct();
        $this->service = $service;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting OpenData synchronization...');

        try {
            $this->info('Syncing Centros Docentes...');
            $this->service->syncCentros();
            $this->info('Centros Docentes synced successfully.');

            $this->info('Syncing Ciclos FP...');
            $this->service->syncCiclos();
            $this->info('Ciclos FP synced successfully.');

            $this->info('All operations completed.');
            return 0;
        } catch (\Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            return 1;
        }
    }
}
