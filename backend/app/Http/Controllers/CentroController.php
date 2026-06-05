<?php
namespace App\Http\Controllers;

use App\Models\Centro;
use App\Models\CentroVisit;
use App\Http\Resources\CentroResource;
use App\Http\Resources\CicloFpResource;
use App\Services\InterestBadgeService;
use Illuminate\Http\Request;

// CONTROLADOR DE CENTROS EDUCATIVOS
// Gestiona la búsqueda, filtrado y recuperación de datos de los centros
class CentroController extends Controller
{

    // LISTADO Y BÚSQUEDA DE CENTROS
    // Aplica los filtros y devuelve resultados paginados o para mapa
    public function index(Request $request)
    {
        $query = Centro::query();

        // Verificar si hay geolocalización
        $hasGeo = $request->filled('lat') && $request->filled('lon') && $request->filled('radius');
        $lat = $hasGeo ? floatval($request->lat) : null;
        $lon = $hasGeo ? floatval($request->lon) : null;
        $radius = $hasGeo ? floatval($request->radius) : null;

        // FILTROS BÁSICOS - se aplican siempre
        if ($request->filled('provincia')) {
            $query->where('provincia', $request->provincia);
        }

        if ($request->filled('municipio')) {
            $query->where('municipio', 'ilike', '%' . $request->municipio . '%');
        }

        if ($request->filled('localidad')) {
            $query->where('localidad', 'ilike', '%' . $request->localidad . '%');
        }

        if ($request->filled('naturaleza')) {
            $query->where('naturaleza', 'ilike', '%' . $request->naturaleza . '%');
        }

        if ($request->filled('denominacion_generica')) {
            $query->where('denominacion_generica', 'ilike', '%' . $request->denominacion_generica . '%');
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where('nombre', 'ilike', "%{$search}%");
        }

        // FILTROS AVANZADOS
        if ($request->filled('nivel')) {
            $query->whereHas('ciclos', function ($q) use ($request) {
                $q->where('nivel', 'ilike', '%' . $request->nivel . '%');
            });
        }

        if ($request->filled('familia')) {
            $query->whereHas('ciclos', function ($q) use ($request) {
                $q->where('familia_profesional', 'ilike', '%' . $request->familia . '%');
            });
        }

        if ($request->filled('modalidad')) {
            $query->whereHas('ciclos', function ($q) use ($request) {
                $q->where('modalidad', 'ilike', '%' . $request->modalidad . '%');
            });
        }

        // FILTRO DE GEOLOCALIZACIÓN - usar whereRaw en lugar de havingRaw
        if ($hasGeo) {
            $query->whereNotNull('latitud')
                  ->whereNotNull('longitud')
                  ->whereRaw(
                      "( 6371 * acos( cos( radians(?) ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitud ) ) ) ) < ?",
                      [$lat, $lon, $lat, $radius]
                  );
        }

        // FILTRADO DE MAPA
        if ($request->has('map')) {
            if ($hasGeo) {
                $query->selectRaw(
                    "id, nombre, latitud, longitud, naturaleza, provincia, municipio, localidad, direccion, denominacion_generica,
                    ( 6371 * acos( cos( radians(?) ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitud ) ) ) ) AS distance",
                    [$lat, $lon, $lat]
                )->orderBy('distance');
            } else {
                $query->select([
                    'id', 'nombre', 'latitud', 'longitud', 'naturaleza',
                    'provincia', 'municipio', 'localidad', 'direccion', 'denominacion_generica'
                ])->orderBy('nombre');
            }

            $centros = $query->limit(2000)->get();

            $data = $centros->map(function ($centro) {
                return [
                    'id' => $centro->id,
                    'nombre' => $centro->nombre,
                    'latitud' => $centro->latitud,
                    'longitud' => $centro->longitud,
                    'naturaleza' => $centro->naturaleza,
                    'provincia' => $centro->provincia,
                    'municipio' => $centro->municipio,
                    'localidad' => $centro->localidad,
                    'direccion' => $centro->direccion,
                    'denominacion_generica' => $centro->denominacion_generica,
                    'distance' => $centro->distance ?? null,
                ];
            });

            return response()->json(['data' => $data]);
        }

        // MODO NORMAL (paginado)
        if ($hasGeo) {
            $query->selectRaw(
                "*, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitud ) ) ) ) AS distance",
                [$lat, $lon, $lat]
            )->orderBy('distance');
        } else {
            $query->orderBy('nombre');
        }

        $paginated = $query->withCount('favoritedBy')->paginate(20);
        return CentroResource::collection($paginated);
    }

    // DETALLE DE UN CENTRO
    // Devuelve la información completa de un centro específico, incluyendo sus ciclos
    public function show(Request $request, $id, InterestBadgeService $badgeService)
    {
        $centro = Centro::with('ciclos')->findOrFail($id);

        // LOG VISIT
        try {
            CentroVisit::create([
                'centro_id' => $centro->id,
                'user_id' => $request->user('sanctum') ? $request->user('sanctum')->id : null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent')
            ]);
        } catch (\Exception $e) {
            // Fail silently
        }

        // Attach interest badges (cached 1h)
        $centro->interestBadges = $badgeService->getBadges($centro);
        $centro->favoritesCount = $badgeService->getFavoritesCount($centro);

        return new CentroResource($centro);
    }

    // CICLOS DEL CENTRO
    // Devuelve específicamente los ciclos formativos impartidos en un centro
    public function ciclos($id)
    {
        $centro = Centro::findOrFail($id);
        return CicloFpResource::collection($centro->ciclos);
    }

    // HISTORIAL DE CENTROS VISITADOS
    // Devuelve los últimos centros visitados por el usuario autenticado
    public function visitedCenters(Request $request)
    {
        $visits = CentroVisit::where('user_id', $request->user()->id)
            ->with('centro:id,nombre,localidad,provincia,naturaleza,direccion,denominacion_generica')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->unique('centro_id') // Evitar duplicados del mismo centro
            ->values();

        return response()->json($visits);
    }

    // ELIMINAR UN CENTRO DEL HISTORIAL
    // Elimina todas las visitas de un centro específico para el usuario
    public function removeVisitedCenter(Request $request, $centroId)
    {
        $deleted = CentroVisit::where('user_id', $request->user()->id)
            ->where('centro_id', $centroId)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Eliminado del historial']);
        }

        return response()->json(['message' => 'No encontrado'], 404);
    }

    // LIMPIAR TODO EL HISTORIAL
    // Elimina todas las visitas del usuario
    public function clearVisitedCenters(Request $request)
    {
        CentroVisit::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Historial limpiado']);
    }

    // SUGERENCIAS DE BÚSQUEDA
    // Autocompletado para la barra de búsqueda por nombre de centro
    // Filtra por provincia si está presente para mostrar solo centros relevantes
    public function suggestions(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|min:2',
            'provincia' => 'nullable|string',
        ]);

        $q = $request->input('q');
        $provincia = $request->input('provincia');

        if (!$q) {
            return response()->json([]);
        }

        $query = Centro::query()
            ->select('nombre')
            ->where('nombre', 'ilike', '%' . $q . '%');

        // Filtrar por provincia si está presente
        if (!empty($provincia)) {
            $query->where('provincia', $provincia);
        }

        $suggestions = $query
            ->distinct()
            ->limit(10)
            ->pluck('nombre');

        return response()->json($suggestions);
    }
}
?>