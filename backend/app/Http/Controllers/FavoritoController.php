<?php

namespace App\Http\Controllers;

use App\Models\Favorito;
use App\Models\CicloFavorito;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * CONTROLADOR DE FAVORITOS
 *
 * Gestiona la lista de centros guardados por el usuario.
 * Incluye información de ciclos favoritos para mostrar qué ciclos
 * específicos le interesan de cada centro.
 */
class FavoritoController extends Controller
{
    /**
     * LISTAR FAVORITOS
     *
     * Devuelve todos los centros marcados como favoritos por el usuario,
     * incluyendo los ciclos específicos que ha marcado como favoritos.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Obtener favoritos con centro y ciclos
        $favoritos = $user->favoritos()
            ->with(['centro.ciclos'])
            ->get();

        // Obtener los IDs de ciclos favoritos del usuario (con manejo de error si la tabla no existe)
        $ciclosFavoritosIds = [];
        try {
            if (\Schema::hasTable('ciclo_favoritos')) {
                $ciclosFavoritosIds = $user->ciclosFavoritos()
                    ->pluck('ciclo_id')
                    ->toArray();
            }
        } catch (\Exception $e) {
            // La tabla no existe todavía, continuar sin ciclos favoritos
            $ciclosFavoritosIds = [];
        }

        // Añadir a cada favorito los ciclos que están marcados
        $favoritos = $favoritos->map(function ($favorito) use ($ciclosFavoritosIds) {
            $favoritoArray = $favorito->toArray();

            // Filtrar los ciclos del centro que están en favoritos
            if ($favorito->centro && $favorito->centro->ciclos && !empty($ciclosFavoritosIds)) {
                $ciclosFavoritos = $favorito->centro->ciclos
                    ->filter(fn($ciclo) => in_array($ciclo->id, $ciclosFavoritosIds))
                    ->values()
                    ->toArray();

                $favoritoArray['ciclos_favoritos'] = $ciclosFavoritos;
            } else {
                $favoritoArray['ciclos_favoritos'] = [];
            }

            return $favoritoArray;
        });

        return response()->json($favoritos);
    }

    /**
     * GUARDAR FAVORITO
     *
     * Añade un centro a la lista de favoritos si no existe ya.
     */
    public function store(Request $request, $id): JsonResponse
    {
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

    /**
     * ELIMINAR FAVORITO
     *
     * Quita un centro de la lista de favoritos.
     * También elimina todos los ciclos favoritos asociados a ese centro.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        // Eliminar primero los ciclos favoritos de este centro (si la tabla existe)
        try {
            if (\Schema::hasTable('ciclo_favoritos')) {
                CicloFavorito::where('user_id', $user->id)
                    ->whereHas('ciclo', function ($query) use ($id) {
                        $query->where('centro_id', $id);
                    })
                    ->delete();
            }
        } catch (\Exception $e) {
            // La tabla no existe todavía, continuar
        }

        // Eliminar el centro de favoritos
        $deleted = Favorito::where('user_id', $user->id)
            ->where('centro_id', $id)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Eliminado de favoritos']);
        }

        return response()->json(['message' => 'No encontrado'], 404);
    }
}
