<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Centro;
use App\Models\CicloFp;
use App\Models\ActivityLog;
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

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'UPDATE_ROLE',
            'description' => "Updated role for user {$user->email} to {$request->role}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Rol actualizado correctamente', 'user' => $user]);
    }

    // Eliminar usuario
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'No se puede eliminar a un administrador.'], 403);
        }

        $user->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'DELETE_USER',
            'description' => "Deleted user {$user->email}",
            'ip_address' => $request->ip(),
        ]);

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
            'registrations_per_day' => User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(6))
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get(),
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
    public function destroyCentro(Request $request, $id)
    {
        $centro = Centro::findOrFail($id);
        $centro->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'DELETE_CENTRO',
            'description' => "Deleted centro {$centro->nombre}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Centro eliminado correctamente']);
    }

    // Bloquear/Desbloquear usuario
    public function toggleBlock(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // No bloquear a otros admins por seguridad (o al menos comprobar)
        if ($user->role === 'admin' && $user->id !== auth()->id()) {
            // Permitir si soy superadmin? Por ahora restringimos bloquear admins.
            return response()->json(['message' => 'No se puede bloquear a un administrador.'], 403);
        }

        $user->is_blocked = !$user->is_blocked;
        $user->save();

        $status = $user->is_blocked ? 'blocked' : 'unblocked';

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'TOGGLE_BLOCK',
            'description' => "User {$user->email} was {$status}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "User {$status} successfully",
            'is_blocked' => $user->is_blocked
        ]);
    }

    // Obtener detalles extendidos de usuario
    public function getUserDetails($id)
    {
        $user = User::with(['favoritos.centro'])->findOrFail($id);

        // Aquí podríamos añadir historial de login si tuviéramos tabla separada,
        // pero usamos last_login_at del modelo User

        return response()->json([
            'user' => $user,
            'stats' => [
                'favorites_count' => $user->favoritos()->count(),
                // 'search_history_count' => ...
            ]
        ]);
    }

    // Resetear contraseña manualmente
    public function resetUserPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed'
        ]);

        $user = User::findOrFail($id);
        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'RESET_PASSWORD',
            'description' => "Reset password for user {$user->email}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }
}
