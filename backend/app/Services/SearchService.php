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
                    if (!empty($filters['nivel'])) { // GM (Grado Medio), GS (Grado Superior), BASICA
                        $this->applyFPNivelFilter($q, $filters['nivel']);
                    }
                    if (!empty($filters['modalidad'])) { // Presencial, Distancia
                        $q->where('modalidad', 'ILIKE', '%' . $filters['modalidad'] . '%');
                    }
                    if (!empty($filters['ciclo'])) { // Nombre del ciclo
                        $q->where('ciclo_formativo', 'ILIKE', '%' . $filters['ciclo'] . '%');
                    }
                });

                // Cargar relación para mostrar datos en frontend
                $query->with([
                    'ciclos' => function ($q) use ($filters) {
                        // Aplicar los mismos filtros al eager loading para que la respuesta sea limpia
                        if (!empty($filters['familia'])) {
                            $q->where('familia_profesional', 'ILIKE', '%' . $filters['familia'] . '%')
                                ->orWhere('codigo_familia', $filters['familia']);
                        }
                        if (!empty($filters['nivel'])) {
                            $this->applyFPNivelFilter($q, $filters['nivel']);
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

            default:
                // Para otros tipos (ESO, BACHILLERATO, PRIMARIA), nos basamos en denominacion_generica
                // OJO: Esto depende de la calidad de los datos en 'denominacion_generica' o 'tipo_ensenanza' si existiera en centros.
                // Asumimos búsqueda por string en denominacion_generica
                $query->where('denominacion_generica', 'ILIKE', '%' . $tipo . '%');
                break;
        }
    }

    private function applyFPNivelFilter(Builder $q, string $nivel)
    {
        $nivel = strtoupper($nivel);
        if ($nivel === 'GM' || $nivel === 'MEDIO') {
            $q->where('nivel_educativo', 'ILIKE', '%GRADO MEDIO%');
        } elseif ($nivel === 'GS' || $nivel === 'SUPERIOR') {
            $q->where('nivel_educativo', 'ILIKE', '%GRADO SUPERIOR%');
        } elseif ($nivel === 'BASICA') {
            $q->where('nivel_educativo', 'ILIKE', '%BASICA%');
        } else {
            $q->where('nivel_educativo', 'ILIKE', '%' . $nivel . '%');
        }
    }
}
