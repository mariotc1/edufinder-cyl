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

        // Obtener patrones de favoritos del usuario si está autenticado
        $userPatterns = null;
        $user = $request->user();
        if ($user) {
            $favoritos = $user->favoritos()->with(['centro.ciclos'])->get();
            if ($favoritos->isNotEmpty()) {
                $userPatterns = $this->recommendationService->extractPatterns($favoritos);
            }
        }

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
            $results = $allResults->unique('id')->take(20)->values();
        } else {
            // Búsqueda normal
            $results = $this->recommendationService->searchFromWizard($filters);
        }

        // Añadir razones de match y score a cada resultado
        $searchService = app(\App\Services\SearchService::class);
        $results = $results->map(function ($centro) use ($filters, $userPatterns, $searchService) {
            // Calcular razones de match
            $centro->match_reasons = $searchService->calculateMatchReasons($centro, $filters);

            // Si hay patrones del usuario, calcular afinidad con sus favoritos
            if ($userPatterns) {
                $similarity = $this->recommendationService->calculateSimilarityScore($centro, $userPatterns);
                $centro->favorite_affinity = $similarity;

                // Añadir indicador si coincide con patrones de favoritos
                if ($similarity >= 5) {
                    $centro->match_reasons[] = [
                        'type' => 'favorite_match',
                        'icon' => 'heart',
                        'text' => 'Similar a tus favoritos'
                    ];
                }
            }

            return $centro;
        });

        // Si hay patrones de favoritos, ordenar por afinidad
        if ($userPatterns) {
            $results = $results->sortByDesc('favorite_affinity')->values();
        }

        // Generar sugerencias de fallback si hay pocos resultados
        $suggestions = $searchService->generateFallbackSuggestions($filters, $results->count());

        // Si no hay resultados, buscar alternativas
        $alternatives = collect();
        if ($results->isEmpty()) {
            $alternatives = $this->findAlternatives($filters, $searchService);
        }

        return response()->json([
            'results' => $results->take(15),
            'total' => $results->count(),
            'filters_applied' => $filters,
            'suggestions' => $suggestions,
            'alternatives' => $alternatives,
            'has_favorite_boost' => $userPatterns !== null
        ]);
    }

    // BUSCAR ALTERNATIVAS
    // Cuando no hay resultados, busca con filtros más relajados
    private function findAlternatives(array $filters, $searchService): \Illuminate\Support\Collection
    {
        $alternatives = collect();

        // Intentar sin filtro de naturaleza
        if (!empty($filters['naturaleza'])) {
            $relaxedFilters = $filters;
            unset($relaxedFilters['naturaleza']);

            $results = $this->recommendationService->searchFromWizard($relaxedFilters);
            if ($results->isNotEmpty()) {
                $alternatives = $alternatives->merge(
                    $results->take(5)->map(function ($centro) use ($relaxedFilters, $searchService) {
                        $centro->match_reasons = $searchService->calculateMatchReasons($centro, $relaxedFilters);
                        $centro->alternative_reason = 'Sin filtrar por titularidad';
                        return $centro;
                    })
                );
            }
        }

        // Intentar sin filtro de modalidad
        if (!empty($filters['modalidad']) && $alternatives->count() < 5) {
            $relaxedFilters = $filters;
            unset($relaxedFilters['modalidad']);

            $results = $this->recommendationService->searchFromWizard($relaxedFilters);
            if ($results->isNotEmpty()) {
                $newAlts = $results->take(5)->map(function ($centro) use ($relaxedFilters, $searchService) {
                    $centro->match_reasons = $searchService->calculateMatchReasons($centro, $relaxedFilters);
                    $centro->alternative_reason = 'Otras modalidades';
                    return $centro;
                });
                $alternatives = $alternatives->merge($newAlts)->unique('id');
            }
        }

        // Intentar con radio ampliado
        if (!empty($filters['radio']) && $filters['radio'] < 50 && $alternatives->count() < 5) {
            $relaxedFilters = $filters;
            $relaxedFilters['radio'] = 100;

            $results = $this->recommendationService->searchFromWizard($relaxedFilters);
            if ($results->isNotEmpty()) {
                $newAlts = $results->take(5)->map(function ($centro) use ($relaxedFilters, $searchService) {
                    $centro->match_reasons = $searchService->calculateMatchReasons($centro, $relaxedFilters);
                    $centro->alternative_reason = 'Ampliando radio de búsqueda';
                    return $centro;
                });
                $alternatives = $alternatives->merge($newAlts)->unique('id');
            }
        }

        return $alternatives->take(5)->values();
    }
}
