'use client';

import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Users, School, BookOpen, UserPlus, TrendingUp, Activity, ArrowRight, Clock } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardChart from '@/components/admin/DashboardChart';
import QuickActions from '@/components/admin/QuickActions';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, error, isLoading } = useSWR('/admin/stats', fetcher);

  if (isLoading) return (
      <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223945]"></div>
      </div>
  );
  
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error cargando estadísticas. Verifica tu conexión.</div>;

  const statCards = [
    { 
        name: 'Usuarios Totales', 
        value: stats.total_users, 
        icon: Users, 
        gradient: 'from-blue-500 to-blue-600', 
        bgIcon: 'bg-blue-50 text-blue-600',
        trend: '+12% vs mes anterior'
    },
    { 
        name: 'Centros Activos', 
        value: stats.total_centros, 
        icon: School, 
        gradient: 'from-emerald-500 to-emerald-600', 
        bgIcon: 'bg-emerald-50 text-emerald-600',
        trend: 'Estable'
    },
    { 
        name: 'Ciclos FP', 
        value: stats.total_ciclos, 
        icon: BookOpen, 
        gradient: 'from-purple-500 to-purple-600', 
        bgIcon: 'bg-purple-50 text-purple-600',
        trend: 'Actualizado hoy'
    },
    { 
        name: 'Nuevos Hoy', 
        value: stats.new_users_today, 
        icon: UserPlus, 
        gradient: 'from-orange-500 to-pink-500', 
        bgIcon: 'bg-orange-50 text-orange-600',
        trend: 'En tiempo real'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-[#223945] tracking-tight">Panel de Control</h1>
            <p className="text-slate-500 mt-1">Bienvenido de nuevo, {user?.name}</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
            <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
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
            className="group relative bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,background-color,border-color] duration-300 p-6"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
            
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgIcon} shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${stat.trend.includes('+') ? 'text-green-600 bg-green-50 border-green-100' : 'text-slate-500 bg-slate-50 border-slate-100'}`}>
                    {stat.trend}
                </span>
            </div>
            
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.name}</p>
                <h3 className="text-3xl font-black text-[#223945]">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Main Content Grid: Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section (Takes 2 columns) */}
        <div className="lg:col-span-2">
             <DashboardChart data={stats?.registrations_per_day || []} />
        </div>

        {/* Quick Actions (Takes 1 column) */}
        <div className="lg:col-span-1 h-full">
            <QuickActions />
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300 relative group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

          <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Actividad Reciente del Sistema
                  </h3>
                   <Link href="/admin/users" className="text-sm text-blue-600 font-bold hover:text-[#223945] flex items-center gap-1 transition-colors">
                      Ver todo <ArrowRight className="w-4 h-4" />
                   </Link>
              </div>
              
              <div className="divide-y divide-slate-100">
                  {stats?.recent_users?.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between py-4 hover:bg-slate-50 px-2 rounded-lg transition-colors -mx-2 bg-gradient-to-r from-transparent via-transparent to-transparent hover:from-slate-50 hover:via-slate-50/50 hover:to-transparent">
                          <div className="flex items-center gap-4">
                                <div className="relative">
                                    {u.foto_perfil ? (
                                        <img src={u.foto_perfil} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" alt="" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-[#223945] flex items-center justify-center font-bold text-sm border border-slate-200">
                                            {u.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#223945] text-sm md:text-base">
                                        <span className="text-blue-600">{u.name}</span> se ha registrado en la plataforma.
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MailIcon className="w-3 h-3" /> {u.email}
                                    </p>
                                </div>
                          </div>
                          <div className="text-right pl-2">
                              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wide mb-1">
                                  Nuevo Usuario
                              </span>
                              <p className="text-[10px] text-slate-400 font-medium font-mono">
                                  {new Date(u.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                          </div>
                      </div>
                  ))}
                  {(!stats?.recent_users || stats.recent_users.length === 0) && (
                      <p className="text-slate-400 text-center py-8 italic">No hay actividad reciente registrada.</p>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    )
}
