<?php
    namespace App\Services;

    use App\Models\Centro;
    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Http\Request;

    // SERVICIO DE BÚSQUEDA AVANZADA
    // Centraliza la lógica de filtrado de centros educativos
    class SearchService {

        // CONSTRUCTOR DE LA QUERY
        // Aplica secuencialmente los filtros recibidos (geo, texto, tipo, etc.)
        public function buildQuery(array $filters): Builder {
            $query = Centro::query();

            // 1. Geolocalización (si se proporcionan lat, lng y radio)
            if (!empty($filters['lat']) && !empty($filters['lng']) && !empty($filters['radio'])) {
                $query->cercanos($filters['lat'], $filters['lng'], $filters['radio']);
            }

            // 2. Filtrado por ubicación administrativa (si no hay geo o adicional)
            if (!empty($filters['provincia'])) {
                $query->where('provincia', 'ILIKE', '%' . $filters['provincia'] . '%');
            }

            if (!empty($filters['municipio'])) {
                $query->where('municipio', 'ILIKE', '%' . $filters['municipio'] . '%');
            }

            // 3. Filtrado por Tipo de Enseñanza (FP vs General)
            if (!empty($filters['tipo'])) {
                $this->applyTypeFilter($query, $filters['tipo'], $filters);
            }

            // 4. Búsqueda por texto libre (nombre, código)
            if (!empty($filters['q'])) {
                $term = '%' . $filters['q'] . '%';
                $query->where(function ($q) use ($term) {
                    $q->where('nombre', 'ILIKE', $term)
                        ->orWhere('codigo', 'ILIKE', $term)
                        ->orWhere('denominacion_generica', 'ILIKE', $term);
                });
            }

            // 5. Filtrado por titularidad (Público, Privado)
            if (!empty($filters['naturaleza'])) {
                $query->where('naturaleza', 'ILIKE', '%' . $filters['naturaleza'] . '%');
            }

            return $query;
        }

        // FILTRO POR TIPO DE ENSEÑANZA
        // Aplica condiciones complejas según si es FP, ESO, Bachillerato, etc.
        private function applyTypeFilter(Builder $query, string $tipo, array $filters) {
            switch (strtoupper($tipo)) {
                case 'FP':
                    // Solo centros con ciclos de FP
                    $query->whereHas('ciclos', function ($q) use ($filters) {
                        
                        // Filtros internos de FP
                        if (!empty($filters['familia'])) {
                            $q->where(function ($sub) use ($filters) {
                                $sub->where('familia_profesional', 'ILIKE', '%' . $filters['familia'] . '%')
                                    ->orWhere('codigo_familia', $filters['familia']);
                            });
                        }

                        if (!empty($filters['nivel'])) {
                            $nivel = mb_strtoupper($filters['nivel']);
                            if ($nivel === 'GM' || $nivel === 'MEDIO') {
                                $q->where('nivel_educativo', 'ILIKE', '%Grado Medio%');

                            } elseif ($nivel === 'GS' || $nivel === 'SUPERIOR') {
                                $q->where('nivel_educativo', 'ILIKE', '%Grado Superior%');

                            } elseif ($nivel === 'BASICA' || $nivel === 'BASICO') {
                                $q->where('nivel_educativo', 'ILIKE', '%Grado B%sico%');

                            } elseif ($nivel === 'CE' || str_contains($nivel, 'ESPECIALIZA')) {
                                $q->where('nivel_educativo', 'ILIKE', '%Curso Especializa%');

                            } else {
                                $q->where('nivel_educativo', 'ILIKE', '%' . $filters['nivel'] . '%');
                            }
                        }

                        if (!empty($filters['modalidad'])) {
                            $q->where('modalidad', 'ILIKE', '%' . $filters['modalidad'] . '%');
                        }

                        if (!empty($filters['ciclo'])) {
                            $q->where('ciclo_formativo', 'ILIKE', '%' . $filters['ciclo'] . '%');
                        }
                    });

                    // Cargar relación para mostrar datos en frontend
                    $query->with([
                        'ciclos' => function ($q) use ($filters) {
                            // OPTIMIZACIÓN: solo seleccionar columnas necesarias
                            $q->select([
                                'id',
                                'centro_id',
                                'familia_profesional',
                                'codigo_familia',
                                'nivel_educativo',
                                'clave_ciclo',
                                'ciclo_formativo',
                                'modalidad',
                                'tipo_ensenanza'
                            ]);

                            // Aplicar los mismos filtros al eager loading
                            if (!empty($filters['familia'])) {
                                $q->where(function ($sub) use ($filters) {
                                    $sub->where('familia_profesional', 'ILIKE', '%' . $filters['familia'] . '%')
                                        ->orWhere('codigo_familia', $filters['familia']);
                                });
                            }

                            if (!empty($filters['nivel'])) {
                                $nivel = mb_strtoupper($filters['nivel']);

                                if ($nivel === 'GM' || $nivel === 'MEDIO') {
                                    $q->where('nivel_educativo', 'ILIKE', '%Grado Medio%');

                                } elseif ($nivel === 'GS' || $nivel === 'SUPERIOR') {
                                    $q->where('nivel_educativo', 'ILIKE', '%Grado Superior%');

                                } elseif ($nivel === 'BASICA' || $nivel === 'BASICO') {
                                    $q->where('nivel_educativo', 'ILIKE', '%Grado B%sico%');

                                } elseif ($nivel === 'CE' || str_contains($nivel, 'ESPECIALIZA')) {
                                    $q->where('nivel_educativo', 'ILIKE', '%Curso Especializa%');

                                } else {
                                    $q->where('nivel_educativo', 'ILIKE', '%' . $filters['nivel'] . '%');
                                }
                            }
                            if (!empty($filters['modalidad'])) {
                                $q->where('modalidad', 'ILIKE', '%' . $filters['modalidad'] . '%');
                            }
                            
                            if (!empty($filters['ciclo'])) {
                                $q->where('ciclo_formativo', 'ILIKE', '%' . $filters['ciclo'] . '%');
                            }
                        }
                    ]);
                    break;

                case 'ESO':
                case 'SECUNDARIA':
                case 'BACHILLERATO':
                    $query->where('denominacion_generica', 'ILIKE', '%SECUNDARIA%');
                    break;

                case 'PRIMARIA':
                case 'INFANTIL':
                    $query->where(function ($q) {
                        $q->where('denominacion_generica', 'ILIKE', '%PRIMARIA%')
                          ->orWhere('denominacion_generica', 'ILIKE', '%INFANTIL%');
                    });
                    break;

                case 'ESPECIAL':
                    $query->where('denominacion_generica', 'ILIKE', '%ESPECIAL%');
                    break;

                default:
                    $query->where('denominacion_generica', 'ILIKE', '%' . $tipo . '%');
                    break;
            }
        }

        // CALCULAR RAZONES DE MATCH
        // Devuelve un array con las razones por las que un centro coincide con los filtros
        public function calculateMatchReasons(Centro $centro, array $filters): array
        {
            $reasons = [];

            // Match por ubicación
            if (!empty($filters['provincia'])) {
                if (stripos($centro->provincia, $filters['provincia']) !== false) {
                    $reasons[] = [
                        'type' => 'location',
                        'icon' => 'map-pin',
                        'text' => 'En ' . $centro->provincia
                    ];
                }
            }

            // Match por geolocalización
            if (!empty($filters['lat']) && !empty($filters['lng']) && $centro->distancia !== null) {
                $distancia = round($centro->distancia, 1);
                $reasons[] = [
                    'type' => 'distance',
                    'icon' => 'navigation',
                    'text' => "A {$distancia} km de ti"
                ];
            }

            // Match por tipo de estudio
            if (!empty($filters['tipo'])) {
                $tipoLabels = [
                    'FP' => 'Formación Profesional',
                    'ESO' => 'ESO/Bachillerato',
                    'PRIMARIA' => 'Infantil/Primaria',
                    'ESPECIAL' => 'Educación Especial'
                ];
                $label = $tipoLabels[strtoupper($filters['tipo'])] ?? $filters['tipo'];
                $reasons[] = [
                    'type' => 'study',
                    'icon' => 'graduation-cap',
                    'text' => $label
                ];
            }

            // Match por naturaleza
            if (!empty($filters['naturaleza'])) {
                $esPublico = stripos($centro->naturaleza, 'PÚBLICO') !== false || stripos($centro->naturaleza, 'PUBLICO') !== false;
                $reasons[] = [
                    'type' => 'ownership',
                    'icon' => $esPublico ? 'landmark' : 'building',
                    'text' => $esPublico ? 'Centro público' : 'Centro privado'
                ];
            }

            // Match por familia profesional (FP)
            if (!empty($filters['familia']) && $centro->ciclos) {
                foreach ($centro->ciclos as $ciclo) {
                    if (stripos($ciclo->familia_profesional, $filters['familia']) !== false) {
                        $reasons[] = [
                            'type' => 'family',
                            'icon' => 'briefcase',
                            'text' => $ciclo->familia_profesional
                        ];
                        break;
                    }
                }
            }

            // Match por nivel (FP)
            if (!empty($filters['nivel']) && $centro->ciclos) {
                $nivelLabels = [
                    'GM' => 'Grado Medio',
                    'GS' => 'Grado Superior',
                    'BASICA' => 'FP Básica',
                    'CE' => 'Especialización'
                ];
                $label = $nivelLabels[strtoupper($filters['nivel'])] ?? $filters['nivel'];
                $reasons[] = [
                    'type' => 'level',
                    'icon' => 'award',
                    'text' => $label
                ];
            }

            // Match por modalidad
            if (!empty($filters['modalidad'])) {
                $esDistancia = stripos($filters['modalidad'], 'DISTANCIA') !== false;
                $reasons[] = [
                    'type' => 'modality',
                    'icon' => $esDistancia ? 'wifi' : 'users',
                    'text' => $esDistancia ? 'A distancia' : 'Presencial'
                ];
            }

            return $reasons;
        }

        // GENERAR SUGERENCIAS DE FALLBACK
        // Cuando no hay resultados, sugiere cómo ampliar la búsqueda
        public function generateFallbackSuggestions(array $filters, int $currentResults): array
        {
            $suggestions = [];

            // Si hay pocos resultados y está usando geolocalización
            if ($currentResults < 5 && !empty($filters['radio']) && $filters['radio'] < 50) {
                $newRadio = min($filters['radio'] + 20, 100);
                $suggestions[] = [
                    'type' => 'expand_radius',
                    'action' => 'radio',
                    'value' => $newRadio,
                    'text' => "Ampliar búsqueda a {$newRadio} km",
                    'icon' => 'expand'
                ];
            }

            // Si filtró por naturaleza
            if ($currentResults < 5 && !empty($filters['naturaleza'])) {
                $suggestions[] = [
                    'type' => 'remove_filter',
                    'action' => 'naturaleza',
                    'value' => null,
                    'text' => 'Incluir públicos y privados',
                    'icon' => 'filter-x'
                ];
            }

            // Si filtró por modalidad
            if ($currentResults < 5 && !empty($filters['modalidad'])) {
                $suggestions[] = [
                    'type' => 'remove_filter',
                    'action' => 'modalidad',
                    'value' => null,
                    'text' => 'Incluir todas las modalidades',
                    'icon' => 'filter-x'
                ];
            }

            // Si filtró por familia profesional
            if ($currentResults < 3 && !empty($filters['familia'])) {
                $suggestions[] = [
                    'type' => 'remove_filter',
                    'action' => 'familia',
                    'value' => null,
                    'text' => 'Ver todas las familias profesionales',
                    'icon' => 'filter-x'
                ];
            }

            // Si hay provincia pero no geolocalización, sugerir provincias vecinas
            if ($currentResults < 3 && !empty($filters['provincia']) && empty($filters['lat'])) {
                $provinciasVecinas = $this->getProvinciasVecinas($filters['provincia']);
                if (!empty($provinciasVecinas)) {
                    $suggestions[] = [
                        'type' => 'nearby_provinces',
                        'action' => 'provincias',
                        'value' => $provinciasVecinas,
                        'text' => 'Buscar también en provincias cercanas',
                        'icon' => 'map'
                    ];
                }
            }

            return $suggestions;
        }

        // OBTENER PROVINCIAS VECINAS
        private function getProvinciasVecinas(string $provincia): array
        {
            $vecinas = [
                'ÁVILA' => ['SALAMANCA', 'VALLADOLID', 'SEGOVIA'],
                'AVILA' => ['SALAMANCA', 'VALLADOLID', 'SEGOVIA'],
                'BURGOS' => ['PALENCIA', 'VALLADOLID', 'SORIA'],
                'LEÓN' => ['ZAMORA', 'VALLADOLID', 'PALENCIA'],
                'LEON' => ['ZAMORA', 'VALLADOLID', 'PALENCIA'],
                'PALENCIA' => ['LEÓN', 'VALLADOLID', 'BURGOS'],
                'SALAMANCA' => ['ZAMORA', 'ÁVILA', 'VALLADOLID'],
                'SEGOVIA' => ['ÁVILA', 'VALLADOLID', 'SORIA'],
                'SORIA' => ['BURGOS', 'SEGOVIA', 'VALLADOLID'],
                'VALLADOLID' => ['PALENCIA', 'BURGOS', 'SEGOVIA', 'ÁVILA', 'SALAMANCA', 'ZAMORA', 'LEÓN'],
                'ZAMORA' => ['LEÓN', 'VALLADOLID', 'SALAMANCA'],
            ];

            $provinciaUpper = mb_strtoupper(trim($provincia));
            return $vecinas[$provinciaUpper] ?? [];
        }
    }
?>