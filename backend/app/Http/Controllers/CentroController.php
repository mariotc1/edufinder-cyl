<?php
    namespace App\Http\Controllers;

    use App\Models\Centro;
    use App\Http\Resources\CentroResource;
    use App\Http\Resources\CicloFpResource;
    use Illuminate\Http\Request;

    // CONTROLADOR DE CENTROS EDUCATIVOS
    // Gestiona la búsqueda, filtrado y recuperación de datos de los centros
    class CentroController extends Controller {
        
        // LISTADO Y BÚSQUEDA DE CENTROS
        // Aplica los filtros y devuelve resultados paginados o para mapa
        public function index(Request $request) {
            $query = Centro::query();

            // FILTROS BÁSICOS
            if ($request->has('provincia')) {
                $query->where('provincia', 'ilike', '%' . $request->provincia . '%');
            }

            if ($request->has('municipio')) {
                $query->where('municipio', 'ilike', '%' . $request->municipio . '%');
            }

            if ($request->has('localidad')) {
                $query->where('localidad', 'ilike', '%' . $request->localidad . '%');
            }

            if ($request->has('naturaleza')) {
                $query->where('naturaleza', 'ilike', '%' . $request->naturaleza . '%');
            }

            if ($request->has('denominacion_generica')) {
                $query->where('denominacion_generica', 'ilike', '%' . $request->denominacion_generica . '%');
            }

            if ($request->has('q')) {
                $search = $request->q;
                $query->where(function ($q) use ($search) {
                    $q->where('nombre', 'ilike', "%{$search}%")
                        ->orWhere('denominacion_generica', 'ilike', "%{$search}%")
                        ->orWhere('provincia', 'ilike', "%{$search}%")
                        ->orWhere('municipio', 'ilike', "%{$search}%");
                });
            }

            // FILTROS AVANZADOS
            if ($request->has('nivel')) {
                $query->whereHas('ciclos', function ($q) use ($request) {
                    $q->where('nivel', 'ilike', '%' . $request->nivel . '%');
                });
            }

            if ($request->has('familia')) {
                $query->whereHas('ciclos', function ($q) use ($request) {
                    $q->where('familia_profesional', 'ilike', '%' . $request->familia . '%');
                });
            }

            if ($request->has('modalidad')) {
                $query->whereHas('ciclos', function ($q) use ($request) {
                    $q->where('modalidad', 'ilike', '%' . $request->modalidad . '%');
                });
            }

            // FILTRO DE PROXIMIDAD (geolocalización)
            // Utiliza la fórmula del Haversine para encontrar centros dentro de un radio específico en KM
            if ($request->has(['lat', 'lon', 'radius'])) {
                $lat = $request->lat;
                $lon = $request->lon;
                $radius = $request->radius; // en km

                // Fórmula de Haversine para calcular distancia esférica
                $query->selectRaw("*, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitud ) ) ) ) AS distance", [$lat, $lon, $lat])
                    ->havingRaw("distance < ?", [$radius])
                    ->orderBy("distance");
                    
            } else {
                $query->orderBy('nombre');
            }

            // FILTRADO DE MAPA 
            // Devuelve todos los centros (o filtro) con estructura ligera para pintar pines en el mapa
            if ($request->has('map')) {
                $cacheKey = 'centros_map_' . md5(json_encode($request->except('map')));
                $shouldCache = count($request->all()) === 1; // solo cachear si es petición limpia

                $callback = function () use ($query, $request) {
                    // si hay filtro de radio, necesitamos la fórmula del Haversine (distance)
                    if ($request->has(['lat', 'lon', 'radius'])) {
                        $lat = $request->lat;
                        $lon = $request->lon;
                        
                        // Re-aplicamos el selectRaw pero restringiendo columnas base
                        $query->selectRaw("id, nombre, latitud, longitud, naturaleza, provincia, municipio, denominacion_generica, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitud ) ) ) ) AS distance", [$lat, $lon, $lat]);

                    } else {
                        $query->select([
                            'id',
                            'nombre',
                            'latitud',
                            'longitud',
                            'naturaleza',
                            'provincia',
                            'municipio',
                            'denominacion_generica'
                        ]);
                    }

                    $centros = $query->limit(2000)->get();

                    return $centros->map(function ($centro) {
                        return [
                            'id' => $centro->id,
                            'nombre' => $centro->nombre,
                            'latitud' => $centro->latitud,
                            'longitud' => $centro->longitud,
                            'naturaleza' => $centro->naturaleza,
                            'provincia' => $centro->provincia,
                            'municipio' => $centro->municipio,
                            'denominacion_generica' => $centro->denominacion_generica,
                            'distance' => isset($centro->distance) ? round($centro->distance, 2) : null,
                        ];
                    });
                };

                $data = $shouldCache
                    ? \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 60, $callback) // 1 hora
                    : $callback();

                return response()->json(['data' => $data]);
            }

            return CentroResource::collection($query->paginate(20));
        }

        // DETALLE DE UN CENTRO
        // Devuelve la información completa de un centro específico, incluyendo sus ciclos
        public function show($id) {
            $centro = Centro::with('ciclos')->findOrFail($id);
            return new CentroResource($centro);
        }

        // CICLOS DEL CENTRO
        // Devuelve específicamente los ciclos formativos impartidos en un centro
        public function ciclos($id) {
            $centro = Centro::findOrFail($id);
            return CicloFpResource::collection($centro->ciclos);
        }

        // SUGERENCIAS DE BÚSQUEDA
        // Autocompletado para la barra de búsqueda por nombre de centro
        public function suggestions(Request $request) {
            $request->validate([
                'q' => 'nullable|string|min:2',
            ]);

            if (!$request->q) {
                return response()->json([]);
            }

            $suggestions = Centro::query()
                ->select('nombre')
                ->where('nombre', 'ilike', '%' . $request->q . '%')
                ->distinct()
                ->limit(10)
                ->pluck('nombre');

            return response()->json($suggestions);
        }
    }
?>