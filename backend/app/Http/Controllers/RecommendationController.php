<?php
namespace App\Http\Controllers;

use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

// CONTROLADOR DE RECOMENDACIONES
// Gestiona las recomendaciones personalizadas de centros educativos
class RecommendationController extends Controller
{
    protected RecommendationService $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    // RECOMENDACIONES BASADAS EN FAVORITOS
    // Analiza los favoritos del usuario y devuelve centros similares
    public function fromFavorites(Request $request): JsonResponse
    {
        $user = $request->user();

        // Obtener favoritos con centro y ciclos
        $favoritos = $user->favoritos()->with(['centro.ciclos'])->get();

        // Si no hay favoritos, devolver array vacío
        if ($favoritos->isEmpty()) {
            return response()->json([
                'recommendations' => [],
                'message' => 'No tienes favoritos guardados'
            ]);
        }

        // Extraer IDs de favoritos para excluirlos
        $favoriteIds = $favoritos->pluck('centro_id')->toArray();

        // Extraer patrones de los favoritos
        $patterns = $this->recommendationService->extractPatterns($favoritos);

        // Buscar centros similares
        $recommendations = $this->recommendationService->findSimilarCenters(
            $patterns,
            $favoriteIds,
            10
        );

        return response()->json([
            'recommendations' => $recommendations,
            'patterns' => [
                'top_provincias' => array_slice(array_keys($patterns['provincias']), 0, 3),
                'top_familias' => array_slice(array_keys($patterns['familias']), 0, 3),
                'preferencia_naturaleza' => array_key_first($patterns['naturalezas']),
            ],
            'total' => $recommendations->count()
        ]);
    }

    // BÚSQUEDA DEL WIZARD
    // Procesa los filtros del wizard de IA y devuelve centros que coincidan
    public function fromWizard(Request $request): JsonResponse
    {
        // Obtener provincias del request (puede venir como array)
        $provincias = $request->input('provincias', []);

        $filters = [
            'provincia' => $request->input('provincia'),
            'tipo' => $request->input('tipo'),
            'naturaleza' => $request->input('naturaleza'),
            'familia' => $request->input('familia'),
            'nivel' => $request->input('nivel'),
            'modalidad' => $request->input('modalidad'),
            'lat' => $request->input('lat'),
            'lng' => $request->input('lng'),
            'radio' => $request->input('radio'),
        ];

        // Limpiar valores nulos
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        // Si se enviaron múltiples provincias
        if (!empty($provincias) && is_array($provincias)) {
            $allResults = collect();

            foreach ($provincias as $provincia) {
                $filtersCopy = $filters;
                $filtersCopy['provincia'] = $provincia;

                $results = $this->recommendationService->searchFromWizard($filtersCopy);
                $allResults = $allResults->merge($results);
            }

            // Eliminar duplicados por ID y limitar
            $results = $allResults->unique('id')->take(15)->values();
        } else {
            // Búsqueda normal
            $results = $this->recommendationService->searchFromWizard($filters);
        }

        return response()->json([
            'results' => $results,
            'total' => $results->count(),
            'filters_applied' => $filters
        ]);
    }
}
