<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Centro;
use App\Models\CicloFp;
use App\Models\SyncLog;
use App\Models\ActivityLog;
use App\Models\CentroVisit;
use App\Models\SearchLog;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function getStats()
    {
        // Calculate growth (simple comparison with last week, or just raw numbers)

        $stats = [
            'users' => [
                'total' => User::count(),
                'new_today' => User::whereDate('created_at', today())->count(),
                'blocked' => User::where('is_blocked', true)->count(),
            ],
            'centros' => [
                'total' => Centro::count(),
                'most_visited' => CentroVisit::select('centro_id', DB::raw('count(*) as total'))
                    ->groupBy('centro_id')
                    ->orderByDesc('total')
                    ->with('centro:id,nombre')
                    ->take(5)
                    ->get(),
            ],
            'ciclos' => [
                'total' => CicloFp::count(),
                'top_searches' => SearchLog::select('query', DB::raw('count(*) as total'))
                    ->groupBy('query')
                    ->orderByDesc('total')
                    ->take(5)
                    ->get(),
            ],
            'system' => [
                'latest_sync' => SyncLog::latest()->first(),
                'total_visits_logged' => CentroVisit::count(),
            ],
            'charts' => [
                'registrations_per_day' => User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->where('created_at', '>=', now()->subDays(6))
                    ->groupBy('date')
                    ->orderBy('date', 'ASC')
                    ->get()
                    ->map(function ($item) {
                        return ['date' => $item->date, 'count' => $item->count];
                    }),
                'visits_per_day' => CentroVisit::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->where('created_at', '>=', now()->subDays(6))
                    ->groupBy('date')
                    ->orderBy('date', 'ASC')
                    ->get()
                    ->map(function ($item) {
                        return ['date' => $item->date, 'count' => $item->count];
                    }),
            ]
        ];

        return response()->json($stats);
    }

    public function getRecentActivity()
    {
        $activities = ActivityLog::with('user:id,name,email,foto_perfil')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($activities);
    }

    public function getSyncStatus()
    {
        $latest = SyncLog::latest()->first();
        // Also get the last 5 logs for history
        $history = SyncLog::orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'latest' => $latest,
            'history' => $history
        ]);
    }

    public function forceSync()
    {
        // Check if one is already running
        $running = SyncLog::where('status', 'running')->exists();
        if ($running) {
            // Check if it's stale (e.g. > 1 hour)
            $stale = SyncLog::where('status', 'running')
                ->where('started_at', '<', now()->subHour())
                ->exists();

            if (!$stale) {
                return response()->json(['message' => 'Synchronization already in progress.'], 409);
            }
        }

        // Trigger command
        // Using exec to run in background so request doesn't timeout
        // Adjust path to artisan as needed. Assuming standard layout.
        $artisanPath = base_path('artisan');
        $command = "php {$artisanPath} opendata:sync > /dev/null 2>&1 &";

        // Log the manual trigger attempt
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'force_sync',
            'description' => 'Sincronización de OpenData iniciada manualmente.',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        // Attempt execution
        if (str_starts_with(php_uname(), 'Windows')) {
            pclose(popen("start /B cmd /c $command", "r"));
        } else {
            exec($command);
        }

        return response()->json(['message' => 'Synchronization started in background.']);
    }
}
