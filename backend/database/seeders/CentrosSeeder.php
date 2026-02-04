<?php
    namespace Database\Seeders;

    use App\Models\Centro;
    use Illuminate\Database\Seeder;
    use Illuminate\Support\Facades\File;
    use Illuminate\Support\Facades\Log;

    // SEEDER DE CENTROS EDUCATIVOS
    // Lee un archivo JSON local y carga los datos en la base de datos
    // Ubicación del archivo JSON: /var/www/data/centros.json (montado vía Docker)
    class CentrosSeeder extends Seeder {

        public function run(): void {
            $jsonPath = '/var/www/data/centros.json';

            // Validación: Verificar que el archivo existe
            if (!File::exists($jsonPath)) {
                Log::error("File not found: $jsonPath");
                return;
            }

            // Lectura y decodificación del JSON
            $json = File::get($jsonPath);
            $data = json_decode($json, true);

            if (!$data) {
                Log::error("Failed to decode JSON from $jsonPath");
                return;
            }

            // Iteración sobre los registros del JSON
            foreach ($data as $item) {
                // Saltar registros sin código de centro
                $codigo = $item['codigo'] ?? null;
                if (!$codigo)
                    continue;

                // Construcción de campos compuestos (nombre completo, dirección)
                $nombre = trim(($item['denominacion_generica'] ?? '') . ' ' . ($item['denominacion_especifica'] ?? ''));
                $direccion = trim(($item['via'] ?? '') . ' ' . ($item['nombre_de_la_via'] ?? '') . ' ' . ($item['numero'] ?? ''));
                if (isset($item['numero_ext']) && $item['numero_ext']) {
                    $direccion .= ' ' . $item['numero_ext'];
                }

                // Upsert: Crear o actualizar basado en el código del centro
                Centro::updateOrCreate(
                    ['codigo' => $codigo],
                    [
                        'nombre' => $nombre,
                        'naturaleza' => $item['naturaleza'] ?? null,
                        'denominacion_generica' => $item['denominacion_generica'] ?? null,
                        'provincia' => $item['provincia'] ?? null,
                        'municipio' => $item['municipio'] ?? null,
                        'localidad' => $item['localidad'] ?? null,
                        'telefono' => $item['telefono'] ?? null,
                        'email' => $item['correo_electronico'] ?? null,
                        'web' => $item['web'] ?? null,
                        'codigo_postal' => $item['c_postal'] ?? null,
                        'direccion' => $direccion,
                        'latitud' => $item['coord_latitud'] ?? null,
                        'longitud' => $item['coord_longitud'] ?? null,
                    ]
                );
            }
        }
    }
?>