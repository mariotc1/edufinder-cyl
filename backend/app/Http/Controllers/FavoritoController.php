<?php

namespace App\Http\Controllers;

use App\Models\Favorito;
use App\Http\Resources\CentroResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoritoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $favoritos = $user->favoritos()->with('centro')->get()->pluck('centro');

        return CentroResource::collection($favoritos);
    }

    public function store(Request $request, $centro_id)
    {
        $user = $request->user();

        // Prevent duplicate
        $exists = Favorito::where('user_id', $user->id)->where('centro_id', $centro_id)->exists();

        if (!$exists) {
            Favorito::create([
                'user_id' => $user->id,
                'centro_id' => $centro_id
            ]);
        }

        return response()->json(['message' => 'Centro añadido a favoritos']);
    }

    public function destroy(Request $request, $centro_id)
    {
        $user = $request->user();

        Favorito::where('user_id', $user->id)->where('centro_id', $centro_id)->delete();

        return response()->json(['message' => 'Centro eliminado de favoritos']);
    }
}
