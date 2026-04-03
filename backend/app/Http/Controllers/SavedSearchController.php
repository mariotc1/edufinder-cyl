<?php
    namespace App\Http\Controllers;

    use App\Models\SavedSearch;
    use Illuminate\Http\Request;

    // CONTROLADOR DE BÚSQUEDAS GUARDADAS
    // Gestiona las búsquedas con filtros guardadas por el usuario
    class SavedSearchController extends Controller {

        // LISTAR BÚSQUEDAS GUARDADAS
        // Devuelve todas las búsquedas guardadas del usuario actual
        public function index(Request $request)
        {
            $searches = $request->user()->savedSearches()
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($searches);
        }

        // GUARDAR BÚSQUEDA
        // Crea una nueva búsqueda guardada con nombre y filtros
        public function store(Request $request) {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'filters' => 'required|array',
            ]);

            $search = $request->user()->savedSearches()->create([
                'name' => $validated['name'],
                'filters' => $validated['filters'],
            ]);

            return response()->json([
                'message' => 'Búsqueda guardada correctamente',
                'search' => $search
            ], 201);
        }

        // ACTUALIZAR BÚSQUEDA GUARDADA
        // Actualiza el nombre y/o filtros de una búsqueda existente
        public function update(Request $request, $id) {
            $search = SavedSearch::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->first();

            if (!$search) {
                return response()->json(['message' => 'No encontrada'], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:100',
                'filters' => 'sometimes|array',
            ]);

            if (isset($validated['name'])) {
                $search->name = $validated['name'];
            }
            if (isset($validated['filters'])) {
                $search->filters = $validated['filters'];
            }
            $search->save();

            return response()->json([
                'message' => 'Búsqueda actualizada correctamente',
                'search' => $search
            ]);
        }

        // ELIMINAR BÚSQUEDA GUARDADA
        // Elimina una búsqueda guardada por su ID
        public function destroy(Request $request, $id) {
            $deleted = SavedSearch::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->delete();

            if ($deleted) {
                return response()->json(['message' => 'Búsqueda eliminada']);
            }

            return response()->json(['message' => 'No encontrada'], 404);
        }
    }
?>
