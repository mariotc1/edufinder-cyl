<?php
namespace App\Services;

use App\Models\Centro;
use App\Models\CicloFp;
use App\Models\SyncChange;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

// SERVICIO DE SINCRONIZACIÓN OPEN DATA
// Gestiona la lógica de descarga, procesamiento y guardado de datos externos
class OpenDataSyncService
{

    protected $timeout = 120;

    protected $urlCentros = 'https://analisis.datosabiertos.jcyl.es/api/v2/catalog/datasets/directorio-de-centros-docentes/exports/json';

    protected $urlFp = 'https://analisis.datosabiertos.jcyl.es/api/v2/catalog/datasets/oferta-de-formacion-profesional/exports/json';

    // Wrappers públicos para iniciar la sincronización de cada dataset
    // $syncLogId permite registrar, por cada centro/ciclo creado o actualizado,
    // un diff real de qué cambió (ver tabla sync_changes) asociado a esa ejecución.
    public function syncCentros(?int $syncLogId = null)
    {
        return $this->syncDataset('centros', $this->urlCentros, function ($record) use ($syncLogId) {
            return $this->processCentro($record, $syncLogId);
        });
    }

    public function syncCiclos(?int $syncLogId = null)
    {
        return $this->syncDataset('ciclos_fp', $this->urlFp, function ($record) use ($syncLogId) {
            return $this->processCiclo($record, $syncLogId);
        });
    }

    // MÉTODO GENÉRICO DE SINCRONIZACIÓN
    // Maneja el ciclo de vida de la sync: descarga, transacción DB, estadísticas y manejo de errores
    protected function syncDataset($datasetName, $url, $processCallback)
    {
        $startTime = microtime(true);
        $syncState = $this->getOrCreateSyncState($datasetName);

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
                'skipped' => 0,
                'total_fetched' => $total
            ];

            DB::beginTransaction();

            foreach ($data as $item) {
                $record = $item;
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

            return $stats;

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

    // DESCARGA DE DATOS
    // Realiza la petición HTTP con timeout configurado y valida la respuesta JSON
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

    // PROCESAMIENTO DE CENTRO
    // Mapea los campos del JSON a la estructura de la tabla 'centros'
    // Utiliza hash para evitar actualizaciones innecesarias si los datos no han cambiado
    protected function processCentro($data, ?int $syncLogId = null)
    {
        $codigo = $data['codigo'] ?? null;
        if (!$codigo)
            return 'skipped';

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

            $oldValues = array_intersect_key($centro->getAttributes(), $hashData);
            $diff = $this->diffFields($oldValues, $hashData);
            $centro->update(array_merge($hashData, ['data_hash' => $newHash]));
            $this->recordChange($syncLogId, 'centros', $hashData['nombre'] ?: $codigo, 'updated', $diff);
            return 'updated';
        } else {
            Centro::create(array_merge(['codigo' => $codigo], $hashData, ['data_hash' => $newHash]));
            $this->recordChange($syncLogId, 'centros', $hashData['nombre'] ?: $codigo, 'created', null);
            return 'created';
        }
    }

    // Compara los valores anteriores con los nuevos y devuelve solo los campos que cambiaron de verdad
    // (evita falsos positivos por formato, ej. "41.0186200" vs 41.01862 en latitud/longitud)
    protected function diffFields(array $old, array $new): array
    {
        $diff = [];
        foreach ($new as $field => $value) {
            $oldValue = $old[$field] ?? null;

            if (is_numeric($oldValue) && is_numeric($value)) {
                $changed = round((float) $oldValue, 6) !== round((float) $value, 6);
            } else {
                $changed = (string) $oldValue !== (string) $value;
            }

            if ($changed) {
                $diff[$field] = [$oldValue, $value];
            }
        }
        return $diff;
    }

    // Guarda un registro de cambio ligado a la ejecución de sync actual (si la hay)
    protected function recordChange(?int $syncLogId, string $dataset, string $label, string $type, ?array $changes): void
    {
        if (!$syncLogId) {
            return;
        }

        SyncChange::create([
            'sync_log_id' => $syncLogId,
            'dataset' => $dataset,
            'entity_label' => $label,
            'change_type' => $type,
            'changes' => $changes,
        ]);
    }

    // PROCESAMIENTO DE CICLO
    // Asocia ciclos formativos a centros existentes y actualiza su información
    protected function processCiclo($data, ?int $syncLogId = null)
    {
        $codigoCentro = $data['codigo_centro'] ?? null;
        $cicloNombre = $data['ciclo_formativo_curso_de_especializacion'] ?? $data['ciclo_formativo'] ?? null;

        if (!$codigoCentro || !$cicloNombre)
            return 'skipped';

        $centro = Centro::where('codigo', $codigoCentro)->first();

        if (!$centro) {
            Log::warning("Centro {$codigoCentro} not found for Ciclo {$cicloNombre}. Skipping.");
            return 'skipped';
        }

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

        $query = CicloFp::where('centro_id', $centro->id);

        if (!empty($hashData['clave_ciclo'])) {
            $query->where('clave_ciclo', $hashData['clave_ciclo']);

        } else {
            $query->where('ciclo_formativo', $hashData['ciclo_formativo']);
        }

        $ciclo = $query->first();

        $label = $centro->nombre . ' — ' . $cicloNombre;

        if ($ciclo) {
            if ($ciclo->data_hash === $newHash) {
                return 'skipped';
            }
            $oldValues = array_intersect_key($ciclo->getAttributes(), $hashData);
            $diff = $this->diffFields($oldValues, $hashData);
            $ciclo->update(array_merge($hashData, ['data_hash' => $newHash]));
            $this->recordChange($syncLogId, 'ciclos_fp', $label, 'updated', $diff);
            return 'updated';

        } else {
            $createData = array_merge($hashData, [
                'centro_id' => $centro->id,
                'data_hash' => $newHash
            ]);
            CicloFp::create($createData);
            $this->recordChange($syncLogId, 'ciclos_fp', $label, 'created', null);
            return 'created';
        }
    }

    // Genera un hash único basado en los datos para detectar cambios
    protected function computeHash($data)
    {
        return md5(json_encode($data));
    }

    // GESTIÓN DE ESTADO
    // Registra el progreso de la sincronización en base de datos para monitoreo
    protected function getOrCreateSyncState($dataset)
    {
        $state = DB::table('data_sync_states')->where('dataset', $dataset)->first();

        if (!$state) {
            $id = DB::table('data_sync_states')->insertGetId([
                'dataset' => $dataset,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }


        return new class ($dataset) {
            private $dataset;

            public function __construct($dataset)
            {
                $this->dataset = $dataset;
            }

            public function update($values)
            {
                $values['updated_at'] = now();
                DB::table('data_sync_states')->where('dataset', $this->dataset)->update($values);
            }
        };
    }
}
?>