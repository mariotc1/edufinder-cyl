<?php
    namespace App\Http\Controllers;

    use App\Services\SearchService;
    use Illuminate\Http\Request;
    use Illuminate\Http\JsonResponse;

    class SearchController extends Controller {
        protected $searchService;

        public function __construct(SearchService $searchService) {
            $this->searchService = $searchService;
        }

        public function index(Request $request): JsonResponse {
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

            $query = $this->searchService->buildQuery($validated);

            $centros = $query->paginate($request->input('per_page', 15));

            return response()->json($centros);
        }
    }
?>