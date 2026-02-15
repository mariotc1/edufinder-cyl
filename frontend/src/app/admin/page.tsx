'use client';

import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Users, School, BookOpen, UserPlus, Clock } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import VisitsChart from '@/components/admin/metrics/VisitsChart';
import PopularCycles from '@/components/admin/metrics/PopularCycles';
import SyncStatusWidget from '@/components/admin/SyncStatusWidget';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import QuickActions from '@/components/admin/QuickActions';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, error, isLoading } = useSWR('/admin/dashboard/stats', fetcher);

  if (isLoading) return (
      <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#223945]"></div>
      </div>
  );
  
  if (error) return (
    <div className="text-red-500 bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm text-center">
        Error cargando estadísticas. Verifica que el servidor está activo.
    </div>
  );

  const statCards = [
    { 
        name: 'Usuarios Totales', 
        value: stats?.users?.total, 
        icon: Users, 
        gradient: 'from-blue-500 to-blue-600', 
        bgIcon: 'bg-blue-50 text-blue-600',
        trend: `${stats?.users?.new_today} nuevos hoy`
    },
    { 
        name: 'Centros Activos', 
        value: stats?.centros?.total, 
        icon: School, 
        gradient: 'from-emerald-500 to-emerald-600', 
        bgIcon: 'bg-emerald-50 text-emerald-600',
        trend: 'Estable'
    },
    { 
        name: 'Ciclos FP', 
        value: stats?.ciclos?.total, 
        icon: BookOpen, 
        gradient: 'from-purple-500 to-purple-600', 
        bgIcon: 'bg-purple-50 text-purple-600',
        trend: 'Actualizado'
    },
    { 
        name: 'Visitas Recientes', 
        value: stats?.charts?.visits_per_day?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0, 
        icon: UserPlus, 
        gradient: 'from-orange-500 to-pink-500', 
        bgIcon: 'bg-orange-50 text-orange-600',
        trend: 'Últimos 7 días'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-black text-[#223945] tracking-tight">Panel de Control</h1>
            <p className="text-slate-500 mt-1 font-medium">Bienvenido de nuevo, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Sistema Online
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat) => (
          <motion.div 
            key={stat.name} 
            variants={item}
            className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-blue-100 transition-all duration-300 p-6 flex flex-col justify-between min-h-[160px]"
          >
            {/* Permanent Top Gradient */}
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${stat.gradient}`}></div>
            
            {/* Decorative Faded Icon */}
            <stat.icon className={`absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] ${stat.bgIcon.replace('bg-', 'text-').split(' ')[1]} transition-transform group-hover:scale-110 duration-500 pointer-events-none`} />

            <div className="flex items-start justify-between relative z-10">
                <div className={`p-3.5 rounded-2xl ${stat.bgIcon} shadow-sm ring-4 ring-slate-50/50 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-7 h-7" />
                </div>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 shadow-sm`}>
                    {stat.trend}
                </span>
            </div>
            
            <div className="relative z-10 mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.name}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-4xl font-black text-[#223945] tracking-tight">{stat.value}</h3>
                </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Main Dashboard Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Left Column (Main Charts) */}
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

        {/* Right Column (Sidebar Widgets) */}
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
  );
}
