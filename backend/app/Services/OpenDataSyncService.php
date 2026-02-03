<?php
    namespace App\Services;

    use App\Models\Centro;
    use App\Models\CicloFp;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Http;
    use Illuminate\Support\Facades\Log;
    use Exception;

    class OpenDataSyncService {

        protected $timeout = 120; 

        protected $urlCentros = 'https://analisis.datosabiertos.jcyl.es/api/v2/catalog/datasets/directorio-de-centros-docentes/exports/json';

        protected $urlFp = 'https://analisis.datosabiertos.jcyl.es/api/v2/catalog/datasets/oferta-de-formacion-profesional/exports/json';

        public function syncCentros() {
            $this->syncDataset('centros', $this->urlCentros, function ($record) {
                return $this->processCentro($record);
            });
        }

        public function syncCiclos() {
            $this->syncDataset('ciclos_fp', $this->urlFp, function ($record) {
                return $this->processCiclo($record);
            });
        }

        protected function syncDataset($datasetName, $url, $processCallback) {
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
                    'skipped' => 0
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

        protected function fetchData($url) {
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

        protected function processCentro($data) {
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

                $centro->update(array_merge($hashData, ['data_hash' => $newHash]));
                return 'updated';
            } else {
                Centro::create(array_merge(['codigo' => $codigo], $hashData, ['data_hash' => $newHash]));
                return 'created';
            }
        }

        protected function processCiclo($data) {
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

            if ($ciclo) {
                if ($ciclo->data_hash === $newHash) {
                    return 'skipped';
                }
                $ciclo->update(array_merge($hashData, ['data_hash' => $newHash]));
                return 'updated';

            } else {
                $createData = array_merge($hashData, [
                    'centro_id' => $centro->id,
                    'data_hash' => $newHash
                ]);
                CicloFp::create($createData);
                return 'created';
            }
        }

        protected function computeHash($data) {
            return md5(json_encode($data));
        }

        protected function getOrCreateSyncState($dataset) {
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

                public function __construct($dataset){
                    $this->dataset = $dataset; 
                }

                public function update($values) {
                    $values['updated_at'] = now();
                    DB::table('data_sync_states')->where('dataset', $this->dataset)->update($values);
                }
            };
        }
    }
?>