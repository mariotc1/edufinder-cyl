<?php

namespace App\Http\Controllers;

use App\Models\ExceptionLog;
use Illuminate\Http\Request;

class AdminIncidentController extends Controller
{
    // Listar incidencias (excepciones reales de la app) paginadas, con filtro opcional por estado
    public function index(Request $request)
    {
        $query = ExceptionLog::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $incidents = $query->orderByDesc('last_seen_at')->paginate(20);

        return response()->json($incidents);
    }

    // Estadísticas para las cards y el badge de salud del sistema
    public function stats()
    {
        return response()->json([
            'open' => ExceptionLog::where('status', 'open')->count(),
            'resolved' => ExceptionLog::where('status', 'resolved')->count(),
            'ignored' => ExceptionLog::where('status', 'ignored')->count(),
            'last_24h' => ExceptionLog::where('last_seen_at', '>=', now()->subDay())->count(),
        ]);
    }

    // Cambiar el estado de una incidencia (resolver / ignorar / reabrir)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,resolved,ignored',
        ]);

        $incident = ExceptionLog::findOrFail($id);
        $incident->status = $request->status;
        $incident->save();

        return response()->json(['message' => 'Estado actualizado', 'incident' => $incident]);
    }

    // Eliminar una incidencia del listado
    public function destroy($id)
    {
        ExceptionLog::findOrFail($id)->delete();

        return response()->json(['message' => 'Incidencia eliminada']);
    }
}
