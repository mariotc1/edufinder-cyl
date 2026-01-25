<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    protected $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Búsqueda avanzada de centros educativos.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Validación básica de parámetros
        $validated = $request->validate([
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'radio' => 'nullable|numeric|min:0|max:500', // km
            'q' => 'nullable|string|max:255',
            'provincia' => 'nullable|string|max:100',
            'municipio' => 'nullable|string|max:100',
            'tipo' => 'nullable|string|max:50', // FP, ESO, etc.
            'familia' => 'nullable|string|max:100', // Para FP
            'nivel' => 'nullable|string|max:50', // GM, GS
            'modalidad' => 'nullable|string|max:50', // Presencial, etc.
            'ciclo' => 'nullable|string|max:150',
            'titularidad' => 'nullable|string|max:50',
        ]);

        // Construir y ejecutar la consulta usando el servicio
        $query = $this->searchService->buildQuery($validated);

        // Paginación
        $centros = $query->paginate($request->input('per_page', 15));

        return response()->json($centros);
    }
}
