<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Centro;
use App\Models\CicloFp;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Listar usuarios con paginación y búsqueda
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($users);
    }

    // Actualizar rol de usuario
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:user,admin,editor'
        ]);

        $user = User::findOrFail($id);

        // Evitar que un admin se quite permisos a sí mismo si es el único (opcional, por seguridad básica)
        if ($user->id === $request->user()->id && $request->role !== 'admin') {
            return response()->json(['message' => 'No puedes quitarte el rol de admin a ti mismo.'], 403);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'Rol actualizado correctamente', 'user' => $user]);
    }

    // Eliminar usuario
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'No se puede eliminar a un administrador.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    // Estadísticas generales para el dashboard
    public function stats()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_centros' => Centro::count(),
            'total_ciclos' => CicloFp::count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'recent_users' => User::orderBy('created_at', 'desc')->take(5)->get(['id', 'name', 'email', 'created_at', 'foto_perfil']),
        ]);
    }
    // Listar centros con paginación y búsqueda
    public function getCentros(Request $request)
    {
        $query = Centro::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%")
                ->orWhere('localidad', 'like', "%{$search}%")
                ->orWhere('codigo', 'like', "%{$search}%");
        }

        $centros = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($centros);
    }

    // Eliminar centro
    public function destroyCentro($id)
    {
        $centro = Centro::findOrFail($id);
        $centro->delete();
        return response()->json(['message' => 'Centro eliminado correctamente']);
    }
}
