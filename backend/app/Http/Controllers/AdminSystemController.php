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
        $dbConnection = false;
        try {
            \Illuminate\Support\Facades\DB::connection()->getPdo();
            $dbConnection = true;
        } catch (\Exception $e) {
            $dbConnection = false;
        }

        $failedJobs = 0;
        try {
            $failedJobs = \Illuminate\Support\Facades\DB::table('failed_jobs')->count();
        } catch (\Exception $e) {
            $failedJobs = 0;
        }

        return response()->json([
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'database_connection' => config('database.default'),
            'database_connected' => $dbConnection,
            'cache_driver' => config('cache.default'),
            'failed_jobs_count' => $failedJobs,
            'debug_mode' => config('app.debug'),
            'maintenance_mode' => app()->isDownForMaintenance(),
            'environment' => app()->environment(),
            'server_time' => now()->toDateTimeString(),
        ]);
    }

    public function clearCache()
    {
        Artisan::call('optimize:clear'); // Clear all cache (config, route, view, event)

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'CLEAR_CACHE',
            'description' => 'System cache cleared manually by admin.',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return response()->json(['message' => 'System cache cleared successfully.']);
    }

    public function toggleMaintenance(Request $request)
    {
        $enable = $request->input('enable');
        // secret key for bypassing maintenance mode
        $secret = 'admin-bypass-secret'; // hardcoded for simplicity, could be env

        if ($enable) {
            Artisan::call('down', [
                '--secret' => $secret
            ]);
            $action = 'enabled';
        } else {
            Artisan::call('up');
            $action = 'disabled';
        }

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'MAINTENANCE_MODE',
            'description' => "Maintenance mode {$action}.",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return response()->json([
            'message' => "Maintenance mode {$action}.",
            'bypass_url' => $enable ? url("/{$secret}") : null
        ]);
    }

    public function getLogs()
    {
        // Return structured Activity Logs from DB instead of raw file
        $logs = ActivityLog::with('user:id,name,email')
            ->latest()
            ->take(100)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'System',
                    'email' => $log->user ? $log->user->email : null,
                    'action' => $log->action,
                    'description' => $log->description,
                    'ip' => $log->ip_address,
                    'date' => $log->created_at->format('Y-m-d H:i:s'),
                    'relative_time' => $log->created_at->diffForHumans()
                ];
            });

        return response()->json(['logs' => $logs]);
    }
}
