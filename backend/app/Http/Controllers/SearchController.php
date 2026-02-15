<?php
namespace App\Http\Controllers;

use App\Services\SearchService;
use App\Models\SearchLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

// CONTROLADOR DE BÚSQUEDA GENERAL
// Punto de entrada centralizado para búsquedas complejas delegando en un servicio
class SearchController extends Controller
{
    protected $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    // EJECUTAR BÚSQUEDA
    // Valida los parámetros y utiliza SearchService para construir la consulta
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'radio' => 'nullable|numeric|min:0|max:500',
            'q' => 'nullable|string|max:255',
            'provincia' => 'nullable|string|max:100',
            'municipio' => 'nullable|string|max:100',
            'tipo' => 'nullable|string|max:50',
            'familia' => 'nullable|string|max:100',
            'nivel' => 'nullable|string|max:50',
            'modalidad' => 'nullable|string|max:50',
            'ciclo' => 'nullable|string|max:150',
            'titularidad' => 'nullable|string|max:50',
        ]);

        // LOG SEARCH
        try {
            SearchLog::create([
                'user_id' => $request->user('sanctum') ? $request->user('sanctum')->id : null,
                'query' => $validated['q'] ?? null,
                'filters' => json_encode(array_filter($validated, function ($v, $k) {
                    return $k !== 'q' && !empty($v);
                }, ARRAY_FILTER_USE_BOTH)),
                'results_count' => 0, // We can update this later or leave it as 0 if not critical for performance
                'ip_address' => $request->ip()
            ]);
        } catch (\Throwable $e) {
            // Fail silently to not block search
            \Illuminate\Support\Facades\Log::error('Search listing failed: ' . $e->getMessage());
        }

        $query = $this->searchService->buildQuery($validated);

        $centros = $query->paginate($request->input('per_page', 15));

        return response()->json($centros);
    }
}
?>