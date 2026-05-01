<?php
namespace App\Http\Controllers;

use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTROLADOR DE RECOMENDACIONES
 *
 * Gestiona las recomendaciones personalizadas de centros educativos.
 * Utiliza un sistema de scoring inteligente basado en:
 * - Ciclos específicos favoriteados (máxima prioridad)
 * - Familias profesionales con ponderación
 * - Proximidad geográfica
 * - Preferencias de naturaleza, nivel, modalidad
 */
class RecommendationController extends Controller
{
    protected RecommendationService $recommendationService;

    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }

    /**
     * RECOMENDACIONES BASADAS EN FAVORITOS
     *
     * Analiza los favoritos del usuario y devuelve centros similares
     * utilizando un sistema de scoring multi-criterio inteligente.
     */
    public function fromFavorites(Request $request): JsonResponse
    {
        $user = $request->user();

        // Obtener favoritos con centro y ciclos
        $favoritos = $user->favoritos()->with(['centro.ciclos'])->get();

        // Si no hay favoritos, devolver array vacío con mensaje amigable
        if ($favoritos->isEmpty()) {
            return response()->json([
                'recommendations' => [],
                'patterns' => null,
                'total' => 0,
                'message' => 'Añade centros a favoritos para recibir recomendaciones personalizadas'
            ]);
        }

        // Extraer IDs de favoritos para excluirlos de resultados
        $favoriteIds = $favoritos->pluck('centro_id')->toArray();

        // Extraer patrones avanzados de los favoritos
        $patterns = $this->recommendationService->extractPatterns($favoritos);

        // Buscar centros similares con el nuevo algoritmo (pasando el usuario para proximidad)
        $recommendations = $this->recommendationService->findSimilarCenters(
            $patterns,
            $favoriteIds,
            10,
            $user
        );

        // Formatear recomendaciones con información enriquecida
        $formattedRecommendations = $recommendations->map(function ($centro) {
            $data = $centro->toArray();

            // Añadir highlights como match_reasons para el frontend
            if (isset($centro->match_highlights)) {
                $data['match_reasons'] = $centro->match_highlights;
            }

            // Añadir score para debugging/transparencia (opcional)
            if (isset($centro->similarity_score)) {
                $data['relevance_score'] = $centro->similarity_score;
            }

            // Añadir distancia si está calculada
            if (isset($centro->distancia_km)) {
                $data['distancia_km'] = $centro->distancia_km;
            }

            return $data;
        });

        // Preparar resumen de patrones para el frontend
        $patternsSummary = [
            'top_provincias' => array_slice(array_keys($patterns['provincias']), 0, 3),
            'top_familias' => array_slice(array_keys($patterns['familias']), 0, 3),
            'top_ciclos' => $this->getTopCiclosNames($patterns['ciclos_especificos'], 3),
            'preferencia_naturaleza' => array_key_first($patterns['naturalezas']),
            'preferencia_nivel' => array_key_first($patterns['niveles']),
            'total_favoritos' => $patterns['total_favoritos'],
        ];

        return response()->json([
            'recommendations' => $formattedRecommendations,
            'patterns' => $patternsSummary,
            'total' => $formattedRecommendations->count(),
            'has_location_boost' => $user->ubicacion_lat && $user->ubicacion_lon,
        ]);
    }

    /**
     * BÚSQUEDA DEL WIZARD
     *
     * Procesa los filtros del wizard de IA y devuelve centros que coincidan.
     * Si el usuario está autenticado, aplica boost basado en sus favoritos.
     */
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
        $user = null;
        try {
            $user = auth('sanctum')->user();
            if ($user) {
                $favoritos = $user->favoritos()->with(['centro.ciclos'])->get();
                if ($favoritos->isNotEmpty()) {
                    $userPatterns = $this->recommendationService->extractPatterns($favoritos);
                }
            }
        } catch (\Exception $e) {
            // Si falla la autenticación, continuar sin boost de favoritos
            $user = null;
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
        $recommendationService = $this->recommendationService;

        // Punto de referencia para proximidad
        $referencePoint = null;
        if ($user && $user->ubicacion_lat && $user->ubicacion_lon) {
            $referencePoint = [
                'lat' => (float) $user->ubicacion_lat,
                'lng' => (float) $user->ubicacion_lon,
            ];
        } elseif ($userPatterns && isset($userPatterns['centroide'])) {
            $referencePoint = $userPatterns['centroide'];
        }

        $results = $results->map(function ($centro) use ($filters, $userPatterns, $searchService, $recommendationService, $referencePoint) {
            $centroArray = $centro->toArray();

            // Calcular razones de match basadas en filtros
            $matchReasons = $searchService->calculateMatchReasons($centro, $filters);

            // Si hay patrones del usuario, calcular afinidad con sus favoritos
            if ($userPatterns) {
                $similarity = $recommendationService->calculateSimilarityScore($centro, $userPatterns);
                $centroArray['favorite_affinity'] = $similarity;

                // Añadir indicador AL PRINCIPIO si coincide significativamente con favoritos
                if ($similarity >= 15) {
                    // Match muy fuerte (probablemente ciclo exacto)
                    array_unshift($matchReasons, [
                        'type' => 'favorite_match',
                        'icon' => 'heart',
                        'text' => 'Muy afín a tus favoritos'
                    ]);
                } elseif ($similarity >= 8) {
                    // Match bueno
                    array_unshift($matchReasons, [
                        'type' => 'favorite_match',
                        'icon' => 'heart',
                        'text' => 'Según tus favoritos'
                    ]);
                }
            }

            $centroArray['match_reasons'] = $matchReasons;
            return $centroArray;
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
            'suggestions' => $suggestions,
            'alternatives' => $alternatives,
            'has_favorite_boost' => $userPatterns !== null
        ]);
    }

    /**
     * BUSCAR ALTERNATIVAS
     *
     * Cuando no hay resultados, busca con filtros más relajados
     */
    private function findAlternatives(array $filters, $searchService): \Illuminate\Support\Collection
    {
        $alternatives = collect();
        $recommendationService = $this->recommendationService;

        // Intentar sin filtro de naturaleza
        if (!empty($filters['naturaleza'])) {
            $relaxedFilters = $filters;
            unset($relaxedFilters['naturaleza']);

            $results = $recommendationService->searchFromWizard($relaxedFilters);
            if ($results->isNotEmpty()) {
                $alternatives = $alternatives->merge(
                    $results->take(5)->map(function ($centro) use ($relaxedFilters, $searchService) {
                        $centroArray = $centro->toArray();
                        $centroArray['match_reasons'] = $searchService->calculateMatchReasons($centro, $relaxedFilters);
                        $centroArray['alternative_reason'] = 'Sin filtrar por titularidad';
                        return $centroArray;
                    })
                );
            }
        }

        // Intentar sin filtro de modalidad
        if (!empty($filters['modalidad']) && $alternatives->count() < 5) {
            $relaxedFilters = $filters;
            unset($relaxedFilters['modalidad']);

            $results = $recommendationService->searchFromWizard($relaxedFilters);
            if ($results->isNotEmpty()) {
                $newAlts = $results->take(5)->map(function ($centro) use ($relaxedFilters, $searchService) {
                    $centroArray = $centro->toArray();
                    $centroArray['match_reasons'] = $searchService->calculateMatchReasons($centro, $relaxedFilters);
                    $centroArray['alternative_reason'] = 'Otras modalidades';
                    return $centroArray;
                });
                $alternatives = $alternatives->merge($newAlts)->unique('id');
            }
        }

        // Intentar con radio ampliado
        if (!empty($filters['radio']) && $filters['radio'] < 50 && $alternatives->count() < 5) {
            $relaxedFilters = $filters;
            $relaxedFilters['radio'] = 100;

            $results = $recommendationService->searchFromWizard($relaxedFilters);
            if ($results->isNotEmpty()) {
                $newAlts = $results->take(5)->map(function ($centro) use ($relaxedFilters, $searchService) {
                    $centroArray = $centro->toArray();
                    $centroArray['match_reasons'] = $searchService->calculateMatchReasons($centro, $relaxedFilters);
                    $centroArray['alternative_reason'] = 'Ampliando radio de búsqueda';
                    return $centroArray;
                });
                $alternatives = $alternatives->merge($newAlts)->unique('id');
            }
        }

        return $alternatives->take(5)->values();
    }

    /**
     * OBTENER NOMBRES DE TOP CICLOS
     *
     * Extrae los nombres de los ciclos más frecuentes de los patrones
     */
    private function getTopCiclosNames(array $ciclosEspecificos, int $limit): array
    {
        $names = [];
        $count = 0;

        foreach ($ciclosEspecificos as $clave => $data) {
            if ($count >= $limit) break;
            if (isset($data['nombre'])) {
                $names[] = $data['nombre'];
                $count++;
            }
        }

        return $names;
    }
}
