<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\BlockedIp;
use App\Services\SecurityLogService;
use Illuminate\Http\Request;

class AdminSecurityController extends Controller
{
    // Listar IPs bloqueadas (activas primero)
    public function blockedIps()
    {
        $ips = BlockedIp::with('admin:id,name')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($ips);
    }

    // Bloquear una IP manualmente desde el admin
    public function blockIp(Request $request)
    {
        $request->validate([
            'ip' => 'required|ip',
            'reason' => 'nullable|string|max:255',
            'permanent' => 'boolean',
            'hours' => 'required_if:permanent,false|integer|min:1',
        ]);

        SecurityLogService::blockIp(
            $request->ip,
            $request->boolean('permanent') ? null : (int) $request->input('hours', 24),
            $request->input('reason', 'Bloqueo manual desde el panel admin'),
            'admin',
            $request->user()->id
        );

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'SECURITY_IP_BLOCKED_MANUAL',
            'description' => "IP {$request->ip} bloqueada manualmente por un administrador.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'IP bloqueada correctamente']);
    }

    // Desbloquear una IP
    public function unblockIp(Request $request, $id)
    {
        $blocked = BlockedIp::findOrFail($id);
        SecurityLogService::unblockIp($blocked->ip);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'SECURITY_IP_UNBLOCKED',
            'description' => "IP {$blocked->ip} desbloqueada manualmente por un administrador.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'IP desbloqueada correctamente']);
    }

    // Eventos de seguridad recientes (login fallidos, patrones de ataque, bots, etc.)
    public function events()
    {
        $events = ActivityLog::with('user:id,name,email')
            ->where('action', 'like', 'SECURITY_%')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($events);
    }

    // Resumen para las cards de la sección de Seguridad
    public function stats()
    {
        return response()->json(SecurityLogService::getStats());
    }
}
