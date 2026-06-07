<?php
namespace App\Http\Controllers;

use App\Models\FpQuizResult;
use Illuminate\Http\Request;

// CONTROLADOR: RESULTADO DEL TEST DE ORIENTACIÓN FP
class FpQuizResultController extends Controller
{
    // Devuelve el análisis guardado del usuario (o 204 si no tiene)
    public function show(Request $request)
    {
        $record = $request->user()->fpQuizResult;

        if (!$record) {
            return response()->json(null, 204);
        }

        return response()->json($record->result);
    }

    // Guarda o sobreescribe el análisis del usuario
    public function store(Request $request)
    {
        $validated = $request->validate([
            'result'       => 'required|array',
            'completed_at' => 'nullable|integer',
        ]);

        FpQuizResult::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'result'       => $validated['result'],
                'completed_at' => isset($validated['completed_at'])
                    ? \Carbon\Carbon::createFromTimestampMs($validated['completed_at'])
                    : now(),
            ]
        );

        return response()->json(['message' => 'Análisis guardado'], 201);
    }

    // Elimina el análisis guardado del usuario
    public function destroy(Request $request)
    {
        $request->user()->fpQuizResult()->delete();
        return response()->json(['message' => 'Análisis eliminado']);
    }
}
