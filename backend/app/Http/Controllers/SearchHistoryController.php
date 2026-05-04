<?php
namespace App\Http\Controllers;

use App\Models\SearchHistory;
use Illuminate\Http\Request;

/**
 * CONTROLADOR DE HISTORIAL DE BÚSQUEDAS
 * Gestiona el historial de búsquedas de centros por usuario
 */
class SearchHistoryController extends Controller
{
    // Máximo de elementos en el historial
    private const MAX_HISTORY_ITEMS = 8;

    /**
     * LISTAR HISTORIAL
     * Devuelve el historial de búsquedas del usuario (máximo 8)
     */
    public function index(Request $request)
    {
        $history = $request->user()->searchHistories()
            ->orderBy('updated_at', 'desc')
            ->limit(self::MAX_HISTORY_ITEMS)
            ->get(['id', 'search_term', 'updated_at']);

        return response()->json($history);
    }

    /**
     * AÑADIR AL HISTORIAL
     * Guarda un término de búsqueda. Si ya existe, actualiza el timestamp.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'search_term' => 'required|string|max:255',
        ]);

        $searchTerm = trim($validated['search_term']);

        // Si ya existe, actualizar el timestamp (moverlo al inicio)
        $existing = $request->user()->searchHistories()
            ->where('search_term', $searchTerm)
            ->first();

        if ($existing) {
            $existing->touch(); // Actualiza updated_at
            return response()->json([
                'message' => 'Historial actualizado',
                'item' => $existing
            ]);
        }

        // Crear nuevo registro
        $item = $request->user()->searchHistories()->create([
            'search_term' => $searchTerm,
        ]);

        // Limpiar historial antiguo si excede el máximo
        $this->cleanOldHistory($request->user()->id);

        return response()->json([
            'message' => 'Añadido al historial',
            'item' => $item
        ], 201);
    }

    /**
     * ELIMINAR ELEMENTO DEL HISTORIAL
     */
    public function destroy(Request $request, $id)
    {
        $deleted = SearchHistory::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Eliminado del historial']);
        }

        return response()->json(['message' => 'No encontrado'], 404);
    }

    /**
     * LIMPIAR TODO EL HISTORIAL
     */
    public function clear(Request $request)
    {
        $request->user()->searchHistories()->delete();

        return response()->json(['message' => 'Historial limpiado']);
    }

    /**
     * SINCRONIZAR HISTORIAL
     * Recibe historial de localStorage y lo merge con el de BD
     */
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'items' => 'present|array|max:' . self::MAX_HISTORY_ITEMS,
            'items.*' => 'string|max:255',
        ]);

        $userId = $request->user()->id;

        // Añadir cada item del localStorage al historial de BD
        foreach ($validated['items'] as $searchTerm) {
            $searchTerm = trim($searchTerm);
            if (empty($searchTerm)) continue;

            SearchHistory::updateOrCreate(
                ['user_id' => $userId, 'search_term' => $searchTerm],
                ['updated_at' => now()]
            );
        }

        // Limpiar exceso
        $this->cleanOldHistory($userId);

        // Devolver historial actualizado
        $history = SearchHistory::where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->limit(self::MAX_HISTORY_ITEMS)
            ->get(['id', 'search_term', 'updated_at']);

        return response()->json([
            'message' => 'Historial sincronizado',
            'history' => $history
        ]);
    }

    /**
     * Elimina registros antiguos si exceden el máximo permitido
     */
    private function cleanOldHistory($userId)
    {
        $count = SearchHistory::where('user_id', $userId)->count();

        if ($count > self::MAX_HISTORY_ITEMS) {
            $toDelete = $count - self::MAX_HISTORY_ITEMS;

            SearchHistory::where('user_id', $userId)
                ->orderBy('updated_at', 'asc')
                ->limit($toDelete)
                ->delete();
        }
    }
}
