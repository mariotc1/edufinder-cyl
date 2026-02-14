'use client';

import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Users, School, BookOpen, UserPlus, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
        trend: '+12% este mes'
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
        <div className="text-sm text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Sistema Operativo
        </div>
      </div>

      {/* Stats Grid - Styling matched to CentroCard */}
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
            {/* Top Gradient Border */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
            
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgIcon} shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">{stat.trend}</span>
            </div>
            
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">{stat.name}</p>
                <h3 className="text-3xl font-black text-[#223945]">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Activity Section - Full width, cleaned up */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300 relative group">
          {/* Top Gradient Border */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

          <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Actividad Reciente
                  </h3>
                   <Link href="/admin/users" className="text-sm text-blue-600 font-bold hover:text-[#223945] flex items-center gap-1 transition-colors">
                      Ver todo <ArrowRight className="w-4 h-4" />
                   </Link>
              </div>
              
              <div className="divide-y divide-slate-100">
                  {stats?.recent_users?.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between py-4 hover:bg-slate-50 px-2 rounded-lg transition-colors -mx-2">
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
                                    <p className="font-bold text-[#223945] text-sm">{u.name}</p>
                                    <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                          </div>
                          <div className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wide">
                                  Nuevo
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                  {new Date(u.created_at).toLocaleDateString()}
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
