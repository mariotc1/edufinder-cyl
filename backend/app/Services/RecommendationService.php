<?php
namespace App\Services;

use App\Models\Centro;
use App\Models\Favorito;
use Illuminate\Support\Collection;

// SERVICIO DE RECOMENDACIONES
// Genera recomendaciones de centros basadas en patrones de favoritos del usuario
class RecommendationService
{
    protected SearchService $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    // EXTRAER PATRONES DE FAVORITOS
    // Analiza los favoritos del usuario y extrae las características más frecuentes
    public function extractPatterns(Collection $favoritos): array
    {
        $patterns = [
            'provincias' => [],
            'familias' => [],
            'niveles' => [],
            'modalidades' => [],
            'naturalezas' => [],
            'tipos' => [],
        ];

        foreach ($favoritos as $favorito) {
            $centro = $favorito->centro;
            if (!$centro) continue;

            // Contar provincias
            if ($centro->provincia) {
                $provincia = mb_strtoupper(trim($centro->provincia));
                $patterns['provincias'][$provincia] = ($patterns['provincias'][$provincia] ?? 0) + 1;
            }

            // Contar naturalezas (público/privado)
            if ($centro->naturaleza) {
                $naturaleza = mb_strtoupper(trim($centro->naturaleza));
                $patterns['naturalezas'][$naturaleza] = ($patterns['naturalezas'][$naturaleza] ?? 0) + 1;
            }

            // Contar tipos de centro
            if ($centro->denominacion_generica) {
                $tipo = $this->normalizeTipo($centro->denominacion_generica);
                if ($tipo) {
                    $patterns['tipos'][$tipo] = ($patterns['tipos'][$tipo] ?? 0) + 1;
                }
            }

            // Analizar ciclos FP si existen
            if ($centro->ciclos && $centro->ciclos->count() > 0) {
                foreach ($centro->ciclos as $ciclo) {
                    // Contar familias profesionales
                    if ($ciclo->familia_profesional) {
                        $familia = mb_strtoupper(trim($ciclo->familia_profesional));
                        $patterns['familias'][$familia] = ($patterns['familias'][$familia] ?? 0) + 1;
                    }

                    // Contar niveles educativos
                    if ($ciclo->nivel_educativo) {
                        $nivel = $this->normalizeNivel($ciclo->nivel_educativo);
                        if ($nivel) {
                            $patterns['niveles'][$nivel] = ($patterns['niveles'][$nivel] ?? 0) + 1;
                        }
                    }

                    // Contar modalidades
                    if ($ciclo->modalidad) {
                        $modalidad = mb_strtoupper(trim($ciclo->modalidad));
                        $patterns['modalidades'][$modalidad] = ($patterns['modalidades'][$modalidad] ?? 0) + 1;
                    }
                }
            }
        }

        // Ordenar cada categoría por frecuencia (descendente)
        foreach ($patterns as $key => $values) {
            arsort($patterns[$key]);
        }

        return $patterns;
    }

    // BUSCAR CENTROS SIMILARES
    // Encuentra centros que coincidan con los patrones extraídos
    public function findSimilarCenters(array $patterns, array $excludeIds, int $limit = 10): Collection
    {
        // Obtener las preferencias más frecuentes
        $topProvincias = array_slice(array_keys($patterns['provincias']), 0, 3);
        $topFamilias = array_slice(array_keys($patterns['familias']), 0, 3);
        $topNiveles = array_slice(array_keys($patterns['niveles']), 0, 2);
        $topNaturaleza = array_key_first($patterns['naturalezas']);
        $topTipo = array_key_first($patterns['tipos']);

        // Construir query base
        $query = Centro::query()
            ->whereNotIn('id', $excludeIds)
            ->with(['ciclos' => function ($q) {
                $q->select([
                    'id', 'centro_id', 'familia_profesional', 'codigo_familia',
                    'nivel_educativo', 'clave_ciclo', 'ciclo_formativo', 'modalidad'
                ]);
            }]);

        // Priorizar por provincia
        if (!empty($topProvincias)) {
            $query->where(function ($q) use ($topProvincias) {
                foreach ($topProvincias as $provincia) {
                    $q->orWhere('provincia', 'ILIKE', '%' . $provincia . '%');
                }
            });
        }

        // Si hay preferencia de FP, filtrar por centros con ciclos
        if ($topTipo === 'FP' && !empty($topFamilias)) {
            $query->whereHas('ciclos', function ($q) use ($topFamilias, $topNiveles) {
                $q->where(function ($sub) use ($topFamilias) {
                    foreach ($topFamilias as $familia) {
                        $sub->orWhere('familia_profesional', 'ILIKE', '%' . $familia . '%');
                    }
                });

                // Filtrar por nivel si existe preferencia clara
                if (!empty($topNiveles)) {
                    $q->where(function ($sub) use ($topNiveles) {
                        foreach ($topNiveles as $nivel) {
                            $sub->orWhere('nivel_educativo', 'ILIKE', '%' . $nivel . '%');
                        }
                    });
                }
            });
        }

        // Obtener resultados
        $centros = $query->limit($limit * 2)->get();

        // Calcular score de similitud para cada centro
        $centrosConScore = $centros->map(function ($centro) use ($patterns) {
            $centro->similarity_score = $this->calculateSimilarityScore($centro, $patterns);
            return $centro;
        });

        // Ordenar por score y tomar los mejores
        return $centrosConScore
            ->sortByDesc('similarity_score')
            ->take($limit)
            ->values();
    }

    // CALCULAR SCORE DE SIMILITUD
    // Puntúa qué tan similar es un centro a los patrones del usuario
    public function calculateSimilarityScore(Centro $centro, array $patterns): float
    {
        $score = 0;

        // Puntos por provincia (máx 3 puntos)
        if ($centro->provincia && isset($patterns['provincias'][mb_strtoupper($centro->provincia)])) {
            $score += 3;
        }

        // Puntos por naturaleza (máx 2 puntos)
        if ($centro->naturaleza && isset($patterns['naturalezas'][mb_strtoupper($centro->naturaleza)])) {
            $score += 2;
        }

        // Puntos por tipo de centro (máx 2 puntos)
        $tipoNormalizado = $this->normalizeTipo($centro->denominacion_generica);
        if ($tipoNormalizado && isset($patterns['tipos'][$tipoNormalizado])) {
            $score += 2;
        }

        // Puntos por ciclos FP (máx 4 puntos)
        if ($centro->ciclos && $centro->ciclos->count() > 0) {
            $familiaMatch = false;
            $nivelMatch = false;

            foreach ($centro->ciclos as $ciclo) {
                // Familia profesional (2 puntos)
                if ($ciclo->familia_profesional) {
                    $familia = mb_strtoupper(trim($ciclo->familia_profesional));
                    if (isset($patterns['familias'][$familia]) && !$familiaMatch) {
                        $score += 2;
                        $familiaMatch = true;
                    }
                }

                // Nivel educativo (2 puntos)
                if ($ciclo->nivel_educativo) {
                    $nivel = $this->normalizeNivel($ciclo->nivel_educativo);
                    if ($nivel && isset($patterns['niveles'][$nivel]) && !$nivelMatch) {
                        $score += 2;
                        $nivelMatch = true;
                    }
                }
            }
        }

        return $score;
    }

    // NORMALIZAR TIPO DE CENTRO
    private function normalizeTipo(?string $denominacion): ?string
    {
        if (!$denominacion) return null;

        $denominacion = mb_strtoupper($denominacion);

        if (str_contains($denominacion, 'SECUNDARIA')) return 'ESO';
        if (str_contains($denominacion, 'PRIMARIA') || str_contains($denominacion, 'INFANTIL')) return 'PRIMARIA';
        if (str_contains($denominacion, 'ESPECIAL')) return 'ESPECIAL';
        if (str_contains($denominacion, 'PROFESIONAL') || str_contains($denominacion, 'FP')) return 'FP';

        return null;
    }

    // NORMALIZAR NIVEL EDUCATIVO
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

    // BUSCAR POR FILTROS DEL WIZARD
    // Utiliza el SearchService existente para buscar con los filtros del wizard
    public function searchFromWizard(array $filters): Collection
    {
        $query = $this->searchService->buildQuery($filters);

        // Limitar resultados y ordenar
        return $query
            ->orderBy('nombre')
            ->limit(15)
            ->get();
    }
}
