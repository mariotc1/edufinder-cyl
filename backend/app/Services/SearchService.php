<?php

namespace App\Services;

use App\Models\Centro;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SearchService
{
    /**
     * Construye la query de búsqueda basada en los filtros recibidos.
     *
     * @param array $filters
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function buildQuery(array $filters): Builder
    {
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

        // 5. Filtrado por titularidad (Público, Privado/Concertado)
        if (!empty($filters['titularidad'])) {
            $query->where('naturaleza', 'ILIKE', '%' . $filters['titularidad'] . '%');
        }

        return $query;
    }

    /**
     * Aplica lógica específica según el tipo de enseñanza.
     */
    private function applyTypeFilter(Builder $query, string $tipo, array $filters)
    {
        switch (strtoupper($tipo)) {
            case 'FP':
                // Solo centros con ciclos de FP
                $query->whereHas('ciclos', function ($q) use ($filters) {
                    // Filtros internos de FP
                    if (!empty($filters['familia'])) {
                        $q->where('familia_profesional', 'ILIKE', '%' . $filters['familia'] . '%')
                            ->orWhere('codigo_familia', $filters['familia']);
                    }
                    if (!empty($filters['nivel'])) {
                        // Logic inlined to avoid scope issues
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
                        // Aplicar los mismos filtros al eager loading
                        if (!empty($filters['familia'])) {
                            $q->where('familia_profesional', 'ILIKE', '%' . $filters['familia'] . '%')
                                ->orWhere('codigo_familia', $filters['familia']);
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
                $query->where('denominacion_generica', 'ILIKE', '%PRIMARIA%')
                    ->orWhere('denominacion_generica', 'ILIKE', '%INFANTIL%');
                break;

            case 'ESPECIAL':
                $query->where('denominacion_generica', 'ILIKE', '%ESPECIAL%');
                break;

            default:
                $query->where('denominacion_generica', 'ILIKE', '%' . $tipo . '%');
                break;
        }
    }
}
