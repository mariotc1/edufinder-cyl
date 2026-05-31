'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Users, School, BookOpen, UserPlus, Clock, Activity, Zap, BarChart2 } from 'lucide-react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import VisitsChart from '@/components/admin/metrics/VisitsChart';
import PopularCycles from '@/components/admin/metrics/PopularCycles';
import SyncStatusWidget from '@/components/admin/SyncStatusWidget';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import QuickActions from '@/components/admin/QuickActions';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

type MobileSection = 'activity' | 'actions' | 'metrics';

const MOBILE_TABS: { id: MobileSection; label: string; icon: React.ElementType }[] = [
  { id: 'activity', label: 'Actividad', icon: Activity },
  { id: 'actions',  label: 'Acciones',  icon: Zap },
  { id: 'metrics',  label: 'Métricas',  icon: BarChart2 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, error, isLoading } = useSWR('/admin/dashboard/stats', fetcher);
  const [mobileSection, setMobileSection] = useState<MobileSection>('activity');
  const [chartType, setChartType] = useState<'users' | 'visits'>('users');

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#223945]" />
    </div>
  );

  if (error) return (
    <div className="text-red-500 bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm text-center">
      Error cargando estadísticas. Verifica que el servidor está activo.
    </div>
  );

  const statCards = [
    {
      name: 'Usuarios',
      value: stats?.users?.total,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgIcon: 'bg-blue-50 text-blue-600',
      trend: `+${stats?.users?.new_today ?? 0} hoy`,
    },
    {
      name: 'Centros',
      value: stats?.centros?.total,
      icon: School,
      gradient: 'from-emerald-500 to-emerald-600',
      bgIcon: 'bg-emerald-50 text-emerald-600',
      trend: 'Estable',
    },
    {
      name: 'Ciclos FP',
      value: stats?.ciclos?.total,
      icon: BookOpen,
      gradient: 'from-purple-500 to-purple-600',
      bgIcon: 'bg-purple-50 text-purple-600',
      trend: 'Actualizado',
    },
    {
      name: 'Visitas 7d',
      value: stats?.charts?.visits_per_day?.reduce((a: number, c: any) => a + c.count, 0) ?? 0,
      icon: UserPlus,
      gradient: 'from-orange-500 to-pink-500',
      bgIcon: 'bg-orange-50 text-orange-600',
      trend: 'Últimos 7 días',
    },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-4 pb-4">

        {/* ── Compact header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#223945] tracking-tight leading-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Hola, {user?.name?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-700">Online</span>
          </div>
        </div>

        {/* ── Compact 2×2 stat cards ── */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm p-4"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`} />
              <div className={`w-9 h-9 rounded-xl ${stat.bgIcon} flex items-center justify-center mb-3`}>
                <stat.icon className="w-[18px] h-[18px]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                {stat.name}
              </p>
              <p className="text-3xl font-black text-[#223945] tracking-tight leading-none">
                {stat.value}
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* ── Section tabs ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-100">
            {MOBILE_TABS.map((tab) => {
              const active = mobileSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMobileSection(tab.id)}
                  className="flex-1 py-3 flex flex-col items-center gap-0.5 relative transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <tab.icon
                    className={`w-4 h-4 transition-colors ${active ? 'text-[#223945]' : 'text-slate-400'}`}
                  />
                  <span className={`text-[10px] font-bold transition-colors ${active ? 'text-[#223945]' : 'text-slate-400'}`}>
                    {tab.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="mobileDashTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#223945]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {mobileSection === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-[360px] overflow-hidden"
              >
                <RecentActivityFeed />
              </motion.div>
            )}

            {mobileSection === 'actions' && (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-[340px] overflow-hidden"
              >
                <QuickActions />
              </motion.div>
            )}

            {mobileSection === 'metrics' && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-4 space-y-4"
              >
                {/* Chart with toggle */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-[#223945]">
                      {chartType === 'users' ? 'Nuevos Registros' : 'Visitas a la Web'}
                    </p>
                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => setChartType('users')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          chartType === 'users' ? 'bg-white shadow-sm text-[#223945]' : 'text-slate-500'
                        }`}
                      >
                        Usuarios
                      </button>
                      <button
                        onClick={() => setChartType('visits')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          chartType === 'visits' ? 'bg-white shadow-sm text-[#223945]' : 'text-slate-500'
                        }`}
                      >
                        Visitas
                      </button>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <VisitsChart
                      data={chartType === 'users'
                        ? stats?.charts?.registrations_per_day
                        : stats?.charts?.visits_per_day}
                      type={chartType}
                    />
                  </div>
                </div>

                {/* Sync status */}
                <div className="h-[260px] flex flex-col">
                  <SyncStatusWidget />
                </div>

                {/* Popular cycles */}
                <div className="h-[240px] flex flex-col">
                  <PopularCycles data={stats?.ciclos?.top_searches} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          DESKTOP LAYOUT (unchanged)
      ════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#223945] tracking-tight">Panel de Control</h1>
            <p className="text-slate-500 mt-1 font-medium">Bienvenido de nuevo, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Sistema Online
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-blue-100 transition-all duration-300 p-6 flex flex-col justify-between min-h-[160px]"
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${stat.gradient}`} />
              <stat.icon className={`absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] pointer-events-none`} />
              <div className="flex items-start justify-between relative z-10">
                <div className={`p-3.5 rounded-2xl ${stat.bgIcon} shadow-sm ring-4 ring-slate-50/50 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 shadow-sm">
                  {stat.trend}
                </span>
              </div>
              <div className="relative z-10 mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.name}</p>
                <h3 className="text-4xl font-black text-[#223945] tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left Column */}
          <div className="flex flex-col gap-8 flex-[2] min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
              <div className="h-[320px]">
                <VisitsChart data={stats?.charts?.registrations_per_day} type="users" />
              </div>
              <div className="h-[320px]">
                <VisitsChart data={stats?.charts?.visits_per_day} type="visits" />
              </div>
            </div>
            <div className="h-[400px] lg:h-[656px] min-h-0">
              <RecentActivityFeed />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 flex-1 min-w-[300px]">
            <div className="h-[320px]">
              <QuickActions />
            </div>
            <div className="h-[320px]">
              <SyncStatusWidget />
            </div>
            <div className="h-[320px]">
              <PopularCycles data={stats?.ciclos?.top_searches} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
