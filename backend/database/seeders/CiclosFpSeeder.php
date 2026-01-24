<?php

namespace Database\Seeders;

use App\Models\Centro;
use App\Models\CicloFp;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class CiclosFpSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = '/var/www/data/oferta_fp.json';

        if (!File::exists($jsonPath)) {
            Log::error("File not found: $jsonPath");
            return;
        }

        $json = File::get($jsonPath);
        $data = json_decode($json, true);

        if (!$data) {
            Log::error("Failed to decode JSON from $jsonPath");
            return;
        }

        foreach ($data as $item) {
            $codigoCentro = $item['codigo_centro'] ?? null;
            if (!$codigoCentro)
                continue;

            $centro = Centro::where('codigo', $codigoCentro)->first();

            if ($centro) {
                // Determine 'ciclo_formativo' field. JSON has 'ciclo_formativo_curso_de_especializacion' or similar?
                // Looking at JSON preview: "ciclo_formativo_curso_de_especializacion": "Administración y Finanzas"

                $cicloNombre = $item['ciclo_formativo_curso_de_especializacion'] ?? $item['ciclo_formativo'] ?? '';

                CicloFp::create([
                    'centro_id' => $centro->id,
                    'familia_profesional' => $item['familia_profesional'] ?? null,
                    'codigo_familia' => $item['codigo_familia'] ?? null,
                    'nivel_educativo' => $item['nivel_educativo'] ?? null,
                    'clave_ciclo' => $item['clave_ciclo'] ?? null,
                    'ciclo_formativo' => $cicloNombre,
                    'modalidad' => $item['modalidad'] ?? null,
                    'tipo_ensenanza' => $item['tipo_ensenanza'] ?? null,
                ]);
            }
        }
    }
}
