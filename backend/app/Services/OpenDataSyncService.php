<?php

namespace App\Services;

use App\Models\Centro;
use App\Models\CicloFp;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class OpenDataSyncService
{
    protected $timeout = 120; // Seconds

    // URLs for Opendatasoft API v2 JSON exports
    protected $urlCentros = 'https://analisis.datosabiertos.jcyl.es/api/v2/catalog/datasets/directorio-de-centros-docentes/exports/json';
    protected $urlFp = 'https://analisis.datosabiertos.jcyl.es/api/v2/catalog/datasets/oferta-de-formacion-profesional/exports/json';

    public function syncCentros()
    {
        $this->syncDataset('centros', $this->urlCentros, function ($record) {
            return $this->processCentro($record);
        });
    }

    public function syncCiclos()
    {
        $this->syncDataset('ciclos_fp', $this->urlFp, function ($record) {
            return $this->processCiclo($record);
        });
    }

    protected function syncDataset($datasetName, $url, $processCallback)
    {
        $startTime = microtime(true);
        $syncState = $this->getOrCreateSyncState($datasetName);

        // Update state to running
        $syncState->update([
            'status' => 'running',
            'error_message' => null,
            'last_sync_at' => now()
        ]);

        try {
            Log::info("Starting sync for {$datasetName}...");

            $data = $this->fetchData($url);
            $total = count($data);

            Log::info("Fetched {$total} records for {$datasetName}.");

            $stats = [
                'processed' => 0,
                'created' => 0,
                'updated' => 0,
                'skipped' => 0
            ];

            DB::beginTransaction();

            foreach ($data as $item) {
                // Determine if item is flat or structured (Opendatasoft export vs records endpoint)
                // Exports/json usually returns array of objects with flat fields or fields object.
                // We'll inspect structure. Based on v2 export, it should be simple. 
                // However, records endpoint returned {record: {fields: ...}}. 
                // Let's assume exports/json returns array of [{...fields...}, ...].
                // If not, we handle it.

                $record = $item;
                // normalize if wrapped (APIs vary)
                if (isset($item['fields'])) {
                    $record = $item['fields'];
                } elseif (isset($item['record']['fields'])) {
                    $record = $item['record']['fields'];
                }

                $result = $processCallback($record);

                $stats['processed']++;
                if ($result === 'created')
                    $stats['created']++;
                elseif ($result === 'updated')
                    $stats['updated']++;
                else
                    $stats['skipped']++;
            }

            DB::commit();

            $syncState->update([
                'status' => 'completed',
                'records_processed' => $stats['processed'],
                'records_created' => $stats['created'],
                'records_updated' => $stats['updated'],
            ]);

            $duration = round(microtime(true) - $startTime, 2);
            Log::info("Sync completed for {$datasetName} in {$duration}s. Stats: " . json_encode($stats));

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Sync failed for {$datasetName}: " . $e->getMessage());
            $syncState->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    protected function fetchData($url)
    {
        $response = Http::timeout($this->timeout)->get($url);

        if ($response->failed()) {
            throw new Exception("HTTP request failed to {$url}: {$response->status()}");
        }

        $json = $response->json();

        if (!is_array($json)) {
            throw new Exception("Invalid JSON response from {$url}");
        }

        return $json;
    }

    protected function processCentro($data)
    {
        $codigo = $data['codigo'] ?? null;
        if (!$codigo)
            return 'skipped'; // Should not happen

        // Relevant fields for hash
        $hashData = [
            'nombre' => $data['denominacion_especifica'] ?? $data['denominacion_generica'] ?? '',
            'naturaleza' => $data['naturaleza'] ?? null,
            'denominacion_generica' => $data['denominacion_generica'] ?? null,
            'provincia' => $data['provincia'] ?? null,
            'municipio' => $data['municipio'] ?? null,
            'localidad' => $data['localidad'] ?? null,
            'telefono' => $data['telefono'] ?? null,
            'email' => $data['correo_electronico'] ?? null,
            'web' => $data['web'] ?? null,
            'codigo_postal' => $data['c_postal'] ?? null,
            'direccion' => ($data['nombre_de_la_via'] ?? '') . ' ' . ($data['numero'] ?? ''),
            'latitud' => $data['coord_latitud'] ?? ($data['localizacion']['lat'] ?? null),
            'longitud' => $data['coord_longitud'] ?? ($data['localizacion']['lon'] ?? null),
        ];

        $newHash = $this->computeHash($hashData);

        $centro = Centro::where('codigo', $codigo)->first();

        if ($centro) {
            if ($centro->data_hash === $newHash) {
                return 'skipped';
            }

            $centro->update(array_merge($hashData, ['data_hash' => $newHash]));
            return 'updated';
        } else {
            Centro::create(array_merge(['codigo' => $codigo], $hashData, ['data_hash' => $newHash]));
            return 'created';
        }
    }

    protected function processCiclo($data)
    {
        $codigoCentro = $data['codigo_centro'] ?? null;
        $cicloNombre = $data['ciclo_formativo_curso_de_especializacion'] ?? $data['ciclo_formativo'] ?? null;

        if (!$codigoCentro || !$cicloNombre)
            return 'skipped';

        // Find parent Centro
        $centro = Centro::where('codigo', $codigoCentro)->first();
        if (!$centro) {
            Log::warning("Centro {$codigoCentro} not found for Ciclo {$cicloNombre}. Skipping.");
            return 'skipped'; // Cannot create cycle without center
        }

        // Relevant fields
        $hashData = [
            'familia_profesional' => $data['familia_profesional'] ?? null,
            'codigo_familia' => $data['codigo_familia'] ?? null,
            'nivel_educativo' => $data['nivel_educativo'] ?? null,
            'clave_ciclo' => $data['clave_ciclo'] ?? null,
            'ciclo_formativo' => $cicloNombre,
            'modalidad' => $data['modalidad'] ?? null,
            'tipo_ensenanza' => $data['tipo_ensenanza'] ?? null,
        ];

        $newHash = $this->computeHash($hashData);

        // Unique key: centro_id + ciclo_formativo (+ maybe clave_ciclo if duplicates exist?)
        // Let's assume (centro_id, ciclo_formativo) is unique enough or we use clave_ciclo if available.
        // The GEMINI.md said: "unique key (codigo_centro + ciclo for fp)"
        // But `ciclos_fp` table doesn't have unique constraint. We should check.
        // ideally match by clave_ciclo if present, else name.

        $query = CicloFp::where('centro_id', $centro->id);

        if (!empty($hashData['clave_ciclo'])) {
            $query->where('clave_ciclo', $hashData['clave_ciclo']);
        } else {
            $query->where('ciclo_formativo', $hashData['ciclo_formativo']);
        }

        $ciclo = $query->first();

        if ($ciclo) {
            if ($ciclo->data_hash === $newHash) {
                return 'skipped';
            }
            $ciclo->update(array_merge($hashData, ['data_hash' => $newHash]));
            return 'updated';
        } else {
            // Need to set centro_id
            $createData = array_merge($hashData, [
                'centro_id' => $centro->id,
                'data_hash' => $newHash
            ]);
            CicloFp::create($createData);
            return 'created';
        }
    }

    protected function computeHash($data)
    {
        return md5(json_encode($data));
    }

    protected function getOrCreateSyncState($dataset)
    {
        // Using DB facade to avoid creating a Model just for this if not needed, 
        // OR assume we can use DB table directly or create a generic model.
        // User told me to valid valid models structure.
        // I created the TABLE. I didn't create a Model for DataSyncState.
        // I should use DB facade or creating a dynamic class.
        // Or better, just use DB::table('data_sync_states')

        $state = DB::table('data_sync_states')->where('dataset', $dataset)->first();

        if (!$state) {
            $id = DB::table('data_sync_states')->insertGetId([
                'dataset' => $dataset,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            // Return query builder for update convenience? No, DB query builder doesn't work like eloquent update on result.
        }

        // Return an object that helps me update.
        // Actually, let's just make helper methods or use DB directly in syncDataset.
        // Refactoring syncDataset to use DB builder.
        return new class ($dataset) {
            private $dataset;
            public function __construct($dataset)
            {
                $this->dataset = $dataset; }
            public function update($values)
            {
                $values['updated_at'] = now();
                DB::table('data_sync_states')->where('dataset', $this->dataset)->update($values);
            }
        };
    }
}
