<?php

namespace App\Http\Controllers;

use App\Models\Favorito;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    public function index(Request $request)
    {
        $favoritos = $request->user()->favoritos()->with('centro')->get();
        return response()->json($favoritos);
    }

    public function store(Request $request, $id)
    {
        // $id is the centro_id
        $exist = Favorito::where('user_id', $request->user()->id)
            ->where('centro_id', $id)
            ->exists();

        if ($exist) {
            return response()->json(['message' => 'Ya está en favoritos'], 409);
        }

        $request->user()->favoritos()->create([
            'centro_id' => $id
        ]);

        return response()->json(['message' => 'Añadido a favoritos']);
    }

    public function destroy(Request $request, $id)
    {
        // $idInTable vs $centroId. 
        // The route is /favoritos/{id}. Usually this ID matches the record ID.
        // But user requirement said: "POST /api/favorites/{id}" (implied centro_id)
        // and "DELETE /api/favorites/{id}".
        // If I use centro_id for ADD, I should probably use centro_id for DELETE to be consistent?
        // Or I should use the ID of the favorite record.
        // Let's assume input ID is centro_id for consistency and ease of use from frontend.

        $deleted = Favorito::where('user_id', $request->user()->id)
            ->where('centro_id', $id)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Eliminado de favoritos']);
        }

        return response()->json(['message' => 'No encontrado'], 404);
    }
}
