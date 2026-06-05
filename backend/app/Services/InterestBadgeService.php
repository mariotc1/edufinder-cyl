<?php

namespace App\Services;

use App\Models\Centro;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class InterestBadgeService
{
    public function getBadges(Centro $centro): array
    {
        $cacheKey = "interest_badges_centro_{$centro->id}";

        return Cache::remember($cacheKey, 3600, function () use ($centro) {
            return $this->computeBadges($centro);
        });
    }

    private function computeBadges(Centro $centro): array
    {
        $badges = [];
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // BADGE: Favoritos
        $favoritesCount = DB::table('favoritos')->where('centro_id', $centro->id)->count();
        if ($favoritesCount >= 3) {
            $badges[] = [
                'type' => 'favorites',
                'value' => $favoritesCount,
                'label' => "{$favoritesCount} " . ($favoritesCount === 1 ? 'persona lo guarda' : 'personas lo guardan'),
            ];
        }

        // BADGE: Visitas este mes
        $viewsThisMonth = DB::table('centro_visits')
            ->where('centro_id', $centro->id)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        if ($viewsThisMonth >= 15) {
            $badges[] = [
                'type' => 'views',
                'value' => $viewsThisMonth,
                'label' => "{$viewsThisMonth} visitas este mes",
            ];
        }

        // BADGE: Tendencia al alza
        $viewsLastMonth = DB::table('centro_visits')
            ->where('centro_id', $centro->id)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        if ($viewsLastMonth >= 5 && $viewsThisMonth > $viewsLastMonth * 1.4) {
            $badges[] = [
                'type' => 'trending',
                'label' => 'Tendencia al alza',
            ];
        }

        // BADGE: Popular en provincia
        if ($viewsThisMonth >= 20) {
            $provincia = $centro->provincia;

            $provinceStats = DB::table('centro_visits')
                ->join('centros', 'centro_visits.centro_id', '=', 'centros.id')
                ->where('centros.provincia', $provincia)
                ->where('centro_visits.created_at', '>=', $startOfMonth)
                ->select('centro_visits.centro_id', DB::raw('COUNT(*) as visits'))
                ->groupBy('centro_visits.centro_id')
                ->orderByDesc('visits')
                ->pluck('visits', 'centro_id')
                ->toArray();

            if (count($provinceStats) >= 2) {
                $sorted = array_values($provinceStats);
                rsort($sorted);
                $total = count($sorted);
                $rank = array_search($viewsThisMonth, $sorted);
                if ($rank !== false && ($rank / $total) <= 0.15) {
                    $badges[] = [
                        'type' => 'province',
                        'label' => 'Popular en ' . ucfirst(mb_strtolower($provincia)),
                    ];
                }
            }
        }

        return $badges;
    }

    public function getFavoritesCount(Centro $centro): int
    {
        return DB::table('favoritos')->where('centro_id', $centro->id)->count();
    }
}
