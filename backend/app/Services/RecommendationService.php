<?php
namespace App\Services;

use App\Models\Centro;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * SERVICIO DE RECOMENDACIONES INTELIGENTES
 *
 * Genera recomendaciones de centros basadas en análisis profundo de favoritos del usuario:
 * - Ciclos específicos favoriteados (máxima prioridad)
 * - Familias profesionales con ponderación por frecuencia
 * - Proximidad geográfica (centroide de favoritos o ubicación del usuario)
 * - Diversidad en resultados (evita saturar con misma localidad)
 */
class RecommendationService
{
    protected SearchService $searchService;

    // Pesos del sistema de scoring (configurables)
    private const SCORE_CICLO_LIKED = 30;        // Ciclo con like directo = máxima prioridad
    private const SCORE_CICLO_EXACTO = 20;       // Mismo ciclo de centro favorito
    private const SCORE_FAMILIA = 10;            // Misma familia profesional
    private const SCORE_NIVEL = 6;               // Mismo nivel (GM, GS, etc.)
    private const SCORE_PROVINCIA = 8;           // Misma provincia
    private const SCORE_PROXIMIDAD_MAX = 12;     // Bonus por cercanía (hasta 12 puntos)
    private const SCORE_NATURALEZA = 4;          // Mismo tipo (público/privado)
    private const SCORE_MODALIDAD = 3;           // Misma modalidad (presencial/distancia)
    private const SCORE_TIPO_CENTRO = 4;         // Mismo tipo de centro (FP, ESO, etc.)

    // Distancia máxima para considerar "cercano" (en km)
    private const MAX_DISTANCE_KM = 100;

    // Máximo de centros por localidad (para diversidad)
    private const MAX_PER_LOCALIDAD = 3;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * EXTRAER PATRONES AVANZADOS DE FAVORITOS
     *
     * Analiza en profundidad los favoritos del usuario extrayendo:
     * - Ciclos con like directo (máxima prioridad)
     * - Ciclos específicos de centros favoriteados
     * - Familias con peso relativo (frecuencia)
     * - Centroide geográfico de los favoritos
     * - Preferencias de naturaleza, nivel, modalidad
     *
     * @param Collection $favoritos Favoritos del usuario (centros)
     * @param array $ciclosLikedIds IDs de ciclos con like directo
     */
    public function extractPatterns(Collection $favoritos, array $ciclosLikedIds = []): array
    {
        $patterns = [
            'ciclos_liked' => [],           // Ciclos con like directo (máxima prioridad)
            'ciclos_especificos' => [],     // Ciclos de centros favoritos
            'familias' => [],               // Familias profesionales con frecuencia
            'niveles' => [],                // Niveles educativos
            'modalidades' => [],            // Presencial/Distancia
            'naturalezas' => [],            // Público/Privado
            'provincias' => [],             // Provincias favoritas
            'tipos' => [],                  // Tipo de centro (FP, ESO, etc.)
            'centroide' => null,            // Centro geográfico de favoritos
            'total_favoritos' => 0,
        ];

        // Convertir IDs de ciclos liked a un set para búsqueda rápida
        $ciclosLikedSet = array_flip($ciclosLikedIds);

        $latitudes = [];
        $longitudes = [];

        foreach ($favoritos as $favorito) {
            $centro = $favorito->centro;
            if (!$centro) continue;

            $patterns['total_favoritos']++;

            // Guardar coordenadas para calcular centroide
            if ($centro->latitud && $centro->longitud) {
                $latitudes[] = (float) $centro->latitud;
                $longitudes[] = (float) $centro->longitud;
            }

            // Provincia (normalizada)
            if ($centro->provincia) {
                $provincia = $this->normalizeString($centro->provincia);
                $patterns['provincias'][$provincia] = ($patterns['provincias'][$provincia] ?? 0) + 1;
            }

            // Naturaleza (público/privado)
            if ($centro->naturaleza) {
                $naturaleza = $this->normalizeString($centro->naturaleza);
                $patterns['naturalezas'][$naturaleza] = ($patterns['naturalezas'][$naturaleza] ?? 0) + 1;
            }

            // Tipo de centro
            if ($centro->denominacion_generica) {
                $tipo = $this->normalizeTipo($centro->denominacion_generica);
                if ($tipo) {
                    $patterns['tipos'][$tipo] = ($patterns['tipos'][$tipo] ?? 0) + 1;
                }
            }

            // Analizar ciclos FP (lo más importante para recomendaciones de calidad)
            if ($centro->ciclos && $centro->ciclos->count() > 0) {
                foreach ($centro->ciclos as $ciclo) {
                    $claveCiclo = $ciclo->clave_ciclo ?: $this->generateClaveCiclo($ciclo);
                    $isLiked = isset($ciclosLikedSet[$ciclo->id]);

                    // Ciclo con like directo → máxima prioridad
                    if ($isLiked) {
                        $patterns['ciclos_liked'][$claveCiclo] = [
                            'id' => $ciclo->id,
                            'nombre' => $ciclo->ciclo_formativo,
                            'familia' => $ciclo->familia_profesional,
                            'nivel' => $ciclo->nivel_educativo,
                        ];

                        // Los ciclos con like directo pesan más en familias y niveles
                        if ($ciclo->familia_profesional) {
                            $familia = $this->normalizeString($ciclo->familia_profesional);
                            $patterns['familias'][$familia] = ($patterns['familias'][$familia] ?? 0) + 3; // x3 peso
                        }
                        if ($ciclo->nivel_educativo) {
                            $nivel = $this->normalizeNivel($ciclo->nivel_educativo);
                            if ($nivel) {
                                $patterns['niveles'][$nivel] = ($patterns['niveles'][$nivel] ?? 0) + 3; // x3 peso
                            }
                        }
                    } else {
                        // Ciclo de centro favorito (sin like directo)
                        if ($ciclo->clave_ciclo || $ciclo->ciclo_formativo) {
                            $patterns['ciclos_especificos'][$claveCiclo] = [
                                'count' => ($patterns['ciclos_especificos'][$claveCiclo]['count'] ?? 0) + 1,
                                'nombre' => $ciclo->ciclo_formativo,
                                'familia' => $ciclo->familia_profesional,
                                'nivel' => $ciclo->nivel_educativo,
                            ];
                        }

                        // Familia profesional (peso normal)
                        if ($ciclo->familia_profesional) {
                            $familia = $this->normalizeString($ciclo->familia_profesional);
                            $patterns['familias'][$familia] = ($patterns['familias'][$familia] ?? 0) + 1;
                        }

                        // Nivel educativo (peso normal)
                        if ($ciclo->nivel_educativo) {
                            $nivel = $this->normalizeNivel($ciclo->nivel_educativo);
                            if ($nivel) {
                                $patterns['niveles'][$nivel] = ($patterns['niveles'][$nivel] ?? 0) + 1;
                            }
                        }
                    }

                    // Modalidad (siempre igual)
                    if ($ciclo->modalidad) {
                        $modalidad = $this->normalizeString($ciclo->modalidad);
                        $patterns['modalidades'][$modalidad] = ($patterns['modalidades'][$modalidad] ?? 0) + 1;
                    }
                }
            }
        }

        // Calcular centroide geográfico
        if (!empty($latitudes) && !empty($longitudes)) {
            $patterns['centroide'] = [
                'lat' => array_sum($latitudes) / count($latitudes),
                'lng' => array_sum($longitudes) / count($longitudes),
            ];
        }

        // Ordenar todas las categorías por frecuencia (descendente)
        foreach (['ciclos_especificos', 'familias', 'niveles', 'modalidades', 'naturalezas', 'provincias', 'tipos'] as $key) {
            if ($key === 'ciclos_especificos') {
                // Para ciclos, ordenar por count
                uasort($patterns[$key], fn($a, $b) => ($b['count'] ?? 0) - ($a['count'] ?? 0));
            } else {
                arsort($patterns[$key]);
            }
        }

        return $patterns;
    }

    /**
     * BUSCAR CENTROS SIMILARES CON SCORING INTELIGENTE
     *
     * En lugar de filtrar estrictamente, busca candidatos amplios y
     * aplica un sistema de scoring ponderado para encontrar los mejores matches.
     */
    public function findSimilarCenters(array $patterns, array $excludeIds, int $limit = 10, ?User $user = null): Collection
    {
        // Si no hay patrones útiles, devolver vacío
        if ($patterns['total_favoritos'] === 0) {
            return collect();
        }

        // Determinar punto de referencia geográfico para scoring
        $referencePoint = $this->getReferencePoint($patterns, $user);

        // Solo mostrar distancia si el usuario tiene ubicación explícita
        $showDistance = $user && $user->ubicacion_lat && $user->ubicacion_lon;

        // Obtener candidatos (búsqueda amplia)
        $candidates = $this->getCandidates($patterns, $excludeIds, $limit * 5);

        if ($candidates->isEmpty()) {
            return collect();
        }

        // Calcular score para cada candidato
        $scoredCandidates = $candidates->map(function ($centro) use ($patterns, $referencePoint, $showDistance) {
            $scoreDetails = $this->calculateAdvancedScore($centro, $patterns, $referencePoint);
            $centro->similarity_score = $scoreDetails['total'];
            $centro->score_breakdown = $scoreDetails['breakdown'];
            $centro->match_highlights = $scoreDetails['highlights'];

            // Solo incluir distancia_km si el usuario tiene ubicación guardada
            if (!$showDistance) {
                unset($centro->distancia_km);
                // Filtrar highlight de proximidad si no hay ubicación del usuario
                $centro->match_highlights = array_filter(
                    $centro->match_highlights,
                    fn($h) => $h['type'] !== 'proximidad'
                );
                $centro->match_highlights = array_values($centro->match_highlights);
            }

            return $centro;
        });

        // Ordenar por score
        $sorted = $scoredCandidates->sortByDesc('similarity_score');

        // Aplicar diversidad (no más de N por localidad)
        $diversified = $this->applyDiversity($sorted, $limit);

        return $diversified->values();
    }

    /**
     * CALCULAR SCORE AVANZADO
     *
     * Sistema de puntuación multi-criterio con ponderación por frecuencia
     */
    private function calculateAdvancedScore(Centro $centro, array $patterns, ?array $referencePoint): array
    {
        $score = 0;
        $breakdown = [];
        $highlights = [];

        $totalFavoritos = max($patterns['total_favoritos'], 1);

        // 1. CICLOS CON LIKE DIRECTO (máxima prioridad)
        $cicloLikedMatch = false;
        if ($centro->ciclos && $centro->ciclos->count() > 0 && !empty($patterns['ciclos_liked'])) {
            foreach ($centro->ciclos as $ciclo) {
                $claveCiclo = $ciclo->clave_ciclo ?: $this->generateClaveCiclo($ciclo);

                if (isset($patterns['ciclos_liked'][$claveCiclo])) {
                    $cicloData = $patterns['ciclos_liked'][$claveCiclo];
                    $points = self::SCORE_CICLO_LIKED; // Máximo score
                    $score += $points;
                    $breakdown['ciclo_liked'] = round($points, 1);
                    $highlights[] = [
                        'type' => 'ciclo_liked',
                        'icon' => 'heart',
                        'text' => $cicloData['nombre'] ?? 'Ciclo que te gusta',
                        'priority' => 0, // Máxima prioridad
                    ];
                    $cicloLikedMatch = true;
                    break;
                }
            }
        }

        // 2. CICLO DE CENTRO FAVORITO (si no hay match de ciclo con like)
        if (!$cicloLikedMatch && $centro->ciclos && $centro->ciclos->count() > 0) {
            foreach ($centro->ciclos as $ciclo) {
                $claveCiclo = $ciclo->clave_ciclo ?: $this->generateClaveCiclo($ciclo);

                if (isset($patterns['ciclos_especificos'][$claveCiclo])) {
                    $cicloData = $patterns['ciclos_especificos'][$claveCiclo];
                    $weight = min($cicloData['count'] / $totalFavoritos, 1);
                    $points = self::SCORE_CICLO_EXACTO * (0.5 + 0.5 * $weight);
                    $score += $points;
                    $breakdown['ciclo_exacto'] = round($points, 1);
                    $highlights[] = [
                        'type' => 'ciclo_exacto',
                        'icon' => 'graduation-cap',
                        'text' => $cicloData['nombre'] ?? 'Ciclo que te interesa',
                        'priority' => 1,
                    ];
                    break;
                }
            }
        }

        // 2. FAMILIA PROFESIONAL
        if ($centro->ciclos && $centro->ciclos->count() > 0) {
            $familiaMatched = false;
            foreach ($centro->ciclos as $ciclo) {
                if ($ciclo->familia_profesional && !$familiaMatched) {
                    $familia = $this->normalizeString($ciclo->familia_profesional);
                    if (isset($patterns['familias'][$familia])) {
                        $weight = min($patterns['familias'][$familia] / $totalFavoritos, 1);
                        $points = self::SCORE_FAMILIA * $weight;
                        $score += $points;
                        $breakdown['familia'] = round($points, 1);

                        // Solo añadir highlight si no hay ciclo exacto
                        if (!isset($breakdown['ciclo_exacto'])) {
                            $highlights[] = [
                                'type' => 'familia',
                                'icon' => 'briefcase',
                                'text' => $ciclo->familia_profesional,
                                'priority' => 2,
                            ];
                        }
                        $familiaMatched = true;
                    }
                }

                // 3. NIVEL EDUCATIVO
                if ($ciclo->nivel_educativo && !isset($breakdown['nivel'])) {
                    $nivel = $this->normalizeNivel($ciclo->nivel_educativo);
                    if ($nivel && isset($patterns['niveles'][$nivel])) {
                        $weight = min($patterns['niveles'][$nivel] / $totalFavoritos, 1);
                        $points = self::SCORE_NIVEL * $weight;
                        $score += $points;
                        $breakdown['nivel'] = round($points, 1);
                    }
                }

                // 4. MODALIDAD
                if ($ciclo->modalidad && !isset($breakdown['modalidad'])) {
                    $modalidad = $this->normalizeString($ciclo->modalidad);
                    if (isset($patterns['modalidades'][$modalidad])) {
                        $weight = min($patterns['modalidades'][$modalidad] / $totalFavoritos, 1);
                        $points = self::SCORE_MODALIDAD * $weight;
                        $score += $points;
                        $breakdown['modalidad'] = round($points, 1);
                    }
                }
            }
        }

        // 5. PROVINCIA
        if ($centro->provincia) {
            $provincia = $this->normalizeString($centro->provincia);
            if (isset($patterns['provincias'][$provincia])) {
                $weight = min($patterns['provincias'][$provincia] / $totalFavoritos, 1);
                $points = self::SCORE_PROVINCIA * $weight;
                $score += $points;
                $breakdown['provincia'] = round($points, 1);
                $highlights[] = [
                    'type' => 'provincia',
                    'icon' => 'map-pin',
                    'text' => ucfirst(strtolower($centro->provincia)),
                    'priority' => 3,
                ];
            }
        }

        // 6. PROXIMIDAD GEOGRÁFICA
        if ($referencePoint && $centro->latitud && $centro->longitud) {
            $distance = $this->calculateDistance(
                $referencePoint['lat'],
                $referencePoint['lng'],
                (float) $centro->latitud,
                (float) $centro->longitud
            );

            $centro->distancia_km = round($distance, 1);

            if ($distance <= self::MAX_DISTANCE_KM) {
                // Score inversamente proporcional a la distancia
                $proximityScore = self::SCORE_PROXIMIDAD_MAX * (1 - ($distance / self::MAX_DISTANCE_KM));
                $score += $proximityScore;
                $breakdown['proximidad'] = round($proximityScore, 1);

                if ($distance <= 30) {
                    $highlights[] = [
                        'type' => 'proximidad',
                        'icon' => 'navigation',
                        'text' => "A {$centro->distancia_km} km",
                        'priority' => 4,
                    ];
                }
            }
        }

        // 7. NATURALEZA (público/privado)
        if ($centro->naturaleza) {
            $naturaleza = $this->normalizeString($centro->naturaleza);
            if (isset($patterns['naturalezas'][$naturaleza])) {
                $weight = min($patterns['naturalezas'][$naturaleza] / $totalFavoritos, 1);
                $points = self::SCORE_NATURALEZA * $weight;
                $score += $points;
                $breakdown['naturaleza'] = round($points, 1);
            }
        }

        // 8. TIPO DE CENTRO
        if ($centro->denominacion_generica) {
            $tipo = $this->normalizeTipo($centro->denominacion_generica);
            if ($tipo && isset($patterns['tipos'][$tipo])) {
                $weight = min($patterns['tipos'][$tipo] / $totalFavoritos, 1);
                $points = self::SCORE_TIPO_CENTRO * $weight;
                $score += $points;
                $breakdown['tipo_centro'] = round($points, 1);
            }
        }

        // Ordenar highlights por prioridad
        usort($highlights, fn($a, $b) => $a['priority'] - $b['priority']);

        return [
            'total' => round($score, 2),
            'breakdown' => $breakdown,
            'highlights' => array_slice($highlights, 0, 3), // Máximo 3 highlights
        ];
    }

    /**
     * OBTENER CANDIDATOS PARA EVALUAR
     *
     * Búsqueda amplia de centros que podrían ser relevantes
     */
    private function getCandidates(array $patterns, array $excludeIds, int $limit): Collection
    {
        $query = Centro::query()
            ->whereNotIn('id', $excludeIds)
            ->with(['ciclos' => function ($q) {
                $q->select([
                    'id', 'centro_id', 'familia_profesional', 'codigo_familia',
                    'nivel_educativo', 'clave_ciclo', 'ciclo_formativo', 'modalidad'
                ]);
            }]);

        // Si hay preferencia clara de FP, priorizar centros con ciclos
        $topTipo = array_key_first($patterns['tipos'] ?? []);
        $hasFPPreference = $topTipo === 'FP' || !empty($patterns['familias']);

        if ($hasFPPreference) {
            // Buscar centros que tengan ciclos (más relevantes para FP)
            $query->whereHas('ciclos');
        }

        // Filtrar por provincias de interés (pero de forma amplia)
        $topProvincias = array_slice(array_keys($patterns['provincias'] ?? []), 0, 5);
        if (!empty($topProvincias)) {
            $query->where(function ($q) use ($topProvincias) {
                foreach ($topProvincias as $provincia) {
                    $q->orWhere('provincia', 'ILIKE', '%' . $provincia . '%');
                }
            });
        }

        return $query->limit($limit)->get();
    }

    /**
     * APLICAR DIVERSIDAD A RESULTADOS
     *
     * Evita saturar con centros de la misma localidad
     */
    private function applyDiversity(Collection $candidates, int $limit): Collection
    {
        $result = collect();
        $localidadCount = [];

        foreach ($candidates as $centro) {
            $localidad = $this->normalizeString($centro->localidad ?? $centro->municipio ?? 'unknown');
            $count = $localidadCount[$localidad] ?? 0;

            if ($count < self::MAX_PER_LOCALIDAD) {
                $result->push($centro);
                $localidadCount[$localidad] = $count + 1;

                if ($result->count() >= $limit) {
                    break;
                }
            }
        }

        // Si no llegamos al límite, añadir más aunque repitan localidad
        if ($result->count() < $limit) {
            foreach ($candidates as $centro) {
                if (!$result->contains('id', $centro->id)) {
                    $result->push($centro);
                    if ($result->count() >= $limit) {
                        break;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * OBTENER PUNTO DE REFERENCIA GEOGRÁFICO
     *
     * Prioridad: ubicación del usuario > centroide de favoritos
     */
    private function getReferencePoint(array $patterns, ?User $user): ?array
    {
        // Primero intentar ubicación del usuario
        if ($user && $user->ubicacion_lat && $user->ubicacion_lon) {
            return [
                'lat' => (float) $user->ubicacion_lat,
                'lng' => (float) $user->ubicacion_lon,
            ];
        }

        // Si no, usar centroide de favoritos
        return $patterns['centroide'] ?? null;
    }

    /**
     * CALCULAR DISTANCIA HAVERSINE
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * GENERAR CLAVE DE CICLO SI NO EXISTE
     */
    private function generateClaveCiclo($ciclo): string
    {
        $parts = [];
        if ($ciclo->codigo_familia) {
            $parts[] = $ciclo->codigo_familia;
        }
        if ($ciclo->ciclo_formativo) {
            $parts[] = substr(md5($ciclo->ciclo_formativo), 0, 6);
        }
        return implode('_', $parts) ?: 'unknown';
    }

    /**
     * NORMALIZAR STRING
     */
    private function normalizeString(?string $value): string
    {
        if (!$value) return '';
        return mb_strtoupper(trim($value));
    }

    /**
     * NORMALIZAR TIPO DE CENTRO
     */
    private function normalizeTipo(?string $denominacion): ?string
    {
        if (!$denominacion) return null;

        $denominacion = mb_strtoupper($denominacion);

        if (str_contains($denominacion, 'FORMACIÓN PROFESIONAL') ||
            str_contains($denominacion, 'FORMACION PROFESIONAL') ||
            str_contains($denominacion, 'CIFP') ||
            str_contains($denominacion, 'FP')) {
            return 'FP';
        }
        if (str_contains($denominacion, 'SECUNDARIA') || str_contains($denominacion, 'IES')) {
            return 'ESO';
        }
        if (str_contains($denominacion, 'PRIMARIA') || str_contains($denominacion, 'INFANTIL')) {
            return 'PRIMARIA';
        }
        if (str_contains($denominacion, 'ESPECIAL')) {
            return 'ESPECIAL';
        }

        return null;
    }

    /**
     * NORMALIZAR NIVEL EDUCATIVO
     */
    private function normalizeNivel(?string $nivel): ?string
    {
        if (!$nivel) return null;

        $nivel = mb_strtoupper($nivel);

        if (str_contains($nivel, 'SUPERIOR')) return 'SUPERIOR';
        if (str_contains($nivel, 'MEDIO')) return 'MEDIO';
        if (str_contains($nivel, 'BÁSICO') || str_contains($nivel, 'BASICO')) return 'BASICO';
        if (str_contains($nivel, 'ESPECIALIZA')) return 'ESPECIALIZACION';

        return null;
    }

    /**
     * BÚSQUEDA POR FILTROS DEL WIZARD
     */
    public function searchFromWizard(array $filters): Collection
    {
        $query = $this->searchService->buildQuery($filters);

        return $query
            ->orderBy('nombre')
            ->limit(15)
            ->get();
    }

    /**
     * CALCULAR SCORE DE SIMILITUD (método legacy para compatibilidad)
     */
    public function calculateSimilarityScore(Centro $centro, array $patterns): float
    {
        $result = $this->calculateAdvancedScore($centro, $patterns, $patterns['centroide'] ?? null);
        return $result['total'];
    }
}
