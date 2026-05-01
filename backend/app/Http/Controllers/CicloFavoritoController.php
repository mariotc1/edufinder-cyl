<?php

namespace App\Http\Controllers;

use App\Models\CicloFavorito;
use App\Models\CicloFp;
use App\Models\Favorito;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

/**
 * CONTROLADOR DE CICLOS FAVORITOS
 *
 * Gestiona los ciclos formativos marcados como favoritos por el usuario.
 * Cuando un usuario da like a un ciclo, el centro se añade automáticamente
 * a favoritos para mantener coherencia.
 */
class CicloFavoritoController extends Controller
{
    /**
     * Verificar si la tabla ciclo_favoritos existe
     */
    private function tableExists(): bool
    {
        try {
            return Schema::hasTable('ciclo_favoritos');
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * LISTAR CICLOS FAVORITOS
     *
     * Devuelve todos los ciclos marcados como favoritos por el usuario,
     * agrupados por centro para facilitar la visualización.
     */
    public function index(Request $request): JsonResponse
    {
        if (!$this->tableExists()) {
            return response()->json([]);
        }

        $ciclosFavoritos = $request->user()
            ->ciclosFavoritos()
            ->with(['ciclo.centro'])
            ->get();

        return response()->json($ciclosFavoritos);
    }

    /**
     * TOGGLE FAVORITO DE CICLO
     *
     * Si el ciclo no está en favoritos, lo añade (y añade el centro si no está).
     * Si ya está en favoritos, lo quita.
     */
    public function toggle(Request $request, int $cicloId): JsonResponse
    {
        if (!$this->tableExists()) {
            return response()->json([
                'message' => 'Función no disponible todavía',
                'is_favorite' => false
            ], 503);
        }

        $user = $request->user();

        // Verificar que el ciclo existe
        $ciclo = CicloFp::with('centro')->find($cicloId);
        if (!$ciclo) {
            return response()->json(['message' => 'Ciclo no encontrado'], 404);
        }

        // Buscar si ya existe el favorito
        $existing = CicloFavorito::where('user_id', $user->id)
            ->where('ciclo_id', $cicloId)
            ->first();

        if ($existing) {
            // Quitar de favoritos
            $existing->delete();

            return response()->json([
                'message' => 'Ciclo eliminado de favoritos',
                'is_favorite' => false,
                'ciclo_id' => $cicloId
            ]);
        }

        // Añadir a favoritos
        CicloFavorito::create([
            'user_id' => $user->id,
            'ciclo_id' => $cicloId
        ]);

        // Auto-añadir el centro a favoritos si no está
        $centroEnFavoritos = Favorito::where('user_id', $user->id)
            ->where('centro_id', $ciclo->centro_id)
            ->exists();

        $centroAdded = false;
        if (!$centroEnFavoritos) {
            Favorito::create([
                'user_id' => $user->id,
                'centro_id' => $ciclo->centro_id
            ]);
            $centroAdded = true;
        }

        return response()->json([
            'message' => 'Ciclo añadido a favoritos',
            'is_favorite' => true,
            'ciclo_id' => $cicloId,
            'centro_added' => $centroAdded,
            'centro_id' => $ciclo->centro_id
        ]);
    }

    /**
     * VERIFICAR SI UN CICLO ESTÁ EN FAVORITOS
     */
    public function check(Request $request, int $cicloId): JsonResponse
    {
        if (!$this->tableExists()) {
            return response()->json([
                'is_favorite' => false,
                'ciclo_id' => $cicloId
            ]);
        }

        $isFavorite = CicloFavorito::where('user_id', $request->user()->id)
            ->where('ciclo_id', $cicloId)
            ->exists();

        return response()->json([
            'is_favorite' => $isFavorite,
            'ciclo_id' => $cicloId
        ]);
    }

    /**
     * OBTENER IDS DE CICLOS FAVORITOS
     *
     * Útil para el frontend para marcar visualmente los ciclos favoritos
     * sin hacer múltiples requests.
     */
    public function ids(Request $request): JsonResponse
    {
        if (!$this->tableExists()) {
            return response()->json(['ciclo_ids' => []]);
        }

        $ids = $request->user()
            ->ciclosFavoritos()
            ->pluck('ciclo_id')
            ->toArray();

        return response()->json(['ciclo_ids' => $ids]);
    }

    /**
     * OBTENER CICLOS FAVORITOS POR CENTRO
     *
     * Devuelve los IDs de ciclos favoritos de un centro específico.
     * Útil para mostrar qué ciclos están marcados en la vista de detalle.
     */
    public function byCentro(Request $request, int $centroId): JsonResponse
    {
        if (!$this->tableExists()) {
            return response()->json(['ciclo_ids' => []]);
        }

        $cicloIds = $request->user()
            ->ciclosFavoritos()
            ->whereHas('ciclo', function ($query) use ($centroId) {
                $query->where('centro_id', $centroId);
            })
            ->pluck('ciclo_id')
            ->toArray();

        return response()->json(['ciclo_ids' => $cicloIds]);
    }
}
