<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use App\Models\ActivityLog;

class AdminSystemController extends Controller
{
    public function getSystemStatus()
    {
        return response()->json([
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'database_connection' => config('database.default'),
            'debug_mode' => config('app.debug'),
            'maintenance_mode' => app()->isDownForMaintenance(),
            'environment' => app()->environment(),
        ]);
    }

    public function clearCache()
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'clear_cache',
            'description' => 'System cache cleared manually.',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return response()->json(['message' => 'System cache cleared successfully.']);
    }

    public function toggleMaintenance(Request $request)
    {
        $enable = $request->input('enable');

        if ($enable) {
            Artisan::call('down', [
                '--secret' => 'admin-bypass-secret' // Optional: bypass key
            ]);
            $action = 'enabled';
        } else {
            Artisan::call('up');
            $action = 'disabled';
        }

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'maintenance_mode',
            'description' => "Maintenance mode {$action}.",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return response()->json(['message' => "Maintenance mode {$action}."]);
    }

    public function getLogs()
    {
        $logFile = storage_path('logs/laravel.log');

        if (!File::exists($logFile)) {
            return response()->json(['logs' => 'No logs found.']);
        }

        // Read last 1000 lines efficiently?
        // simple file_get_contents might be too big.
        // Let's just get the last 20KB for now.

        $size = File::size($logFile);
        $readSize = 20000; // 20KB

        $content = '';
        if ($size > $readSize) {
            $content = file_get_contents($logFile, false, null, $size - $readSize, $readSize);
        } else {
            $content = File::get($logFile);
        }

        return response()->json(['logs' => $content]);
    }
}
