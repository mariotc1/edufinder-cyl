'use client';

import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Users, School, BookOpen, UserPlus, TrendingUp, Activity } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, error, isLoading } = useSWR('/admin/stats', fetcher);

  if (isLoading) return (
      <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
  );
  
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error cargando estadísticas. Verifica tu conexión.</div>;

  const statCards = [
    { 
        name: 'Usuarios Totales', 
        value: stats.total_users, 
        icon: Users, 
        gradient: 'from-blue-500 to-blue-600', 
        shadow: 'shadow-blue-500/30',
        trend: '+12% este mes'
    },
    { 
        name: 'Centros Activos', 
        value: stats.total_centros, 
        icon: School, 
        gradient: 'from-emerald-500 to-emerald-600', 
        shadow: 'shadow-emerald-500/30',
        trend: 'Estable'
    },
    { 
        name: 'Ciclos FP', 
        value: stats.total_ciclos, 
        icon: BookOpen, 
        gradient: 'from-purple-500 to-purple-600', 
        shadow: 'shadow-purple-500/30', // Fixed syntax error here
        trend: 'Actualizado hoy'
    },
    { 
        name: 'Nuevos Hoy', 
        value: stats.new_users_today, 
        icon: UserPlus, 
        gradient: 'from-orange-500 to-pink-500', 
        shadow: 'shadow-orange-500/30',
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
            className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <stat.icon className="w-24 h-24 text-slate-900" />
            </div>

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg ${stat.shadow} mb-4`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.name}</p>
                <div className="flex items-end gap-2 mt-1">
                    <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                    <span className="text-xs font-medium text-slate-400 mb-1.5">{stat.trend}</span>
                </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Registrations */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Actividad Reciente
                  </h3>
                  <button className="text-sm text-blue-600 font-medium hover:underline">Ver todo</button>
              </div>
              
              <div className="space-y-4">
                  {stats?.recent_users?.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                          <div className="flex items-center gap-4">
                                {u.foto_perfil ? (
                                    <img src={u.foto_perfil} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                                        {u.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{u.name}</p>
                                    <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                          </div>
                          <div className="text-right">
                              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                                  Nuevo Registro
                              </span>
                              <p className="text-xs text-slate-400 mt-1">
                                  {new Date(u.created_at).toLocaleDateString()}
                              </p>
                          </div>
                      </div>
                  ))}
                  {(!stats?.recent_users || stats.recent_users.length === 0) && (
                      <p className="text-slate-400 text-center py-4">No hay actividad reciente.</p>
                  )}
              </div>
          </div>

          {/* Quick Actions / Upsell */}
          <div className="bg-gradient-to-br from-[#223945] to-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 p-6 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
               
               <h3 className="text-xl font-bold mb-2 relative z-10">Panel Pro</h3>
               <p className="text-slate-300 text-sm mb-6 relative z-10">
                   Este panel es una versión inicial. Para escalar el SaaS, recomendamos conectar PostHog para analíticas de verdad.
               </p>

               <div className="space-y-3 relative z-10">
                   <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-md">
                       <TrendingUp className="w-5 h-5 text-blue-400" />
                       <div>
                           <p className="text-sm font-bold">Analíticas Detalladas</p>
                           <p className="text-xs text-slate-400">Próximamente</p>
                       </div>
                   </div>
               </div>

               <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/50 transition-all">
                   Ver Roadmap
               </button>
          </div>
      </div>
    </div>
  );
}
