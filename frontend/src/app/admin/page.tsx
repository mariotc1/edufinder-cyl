'use client';

import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Users, School, BookOpen, UserPlus } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, error, isLoading } = useSWR('/admin/stats', fetcher);

  if (isLoading) return <div className="text-center p-10">Cargando estadísticas...</div>;
  if (error) return <div className="text-red-500 p-10">Error cargando estadísticas</div>;

  const statCards = [
    { name: 'Usuarios Totales', value: stats.total_users, icon: Users, color: 'bg-blue-500' },
    { name: 'Centros', value: stats.total_centros, icon: School, color: 'bg-green-500' },
    { name: 'Ciclos FP', value: stats.total_ciclos, icon: BookOpen, color: 'bg-purple-500' },
    { name: 'Nuevos Hoy', value: stats.new_users_today, icon: UserPlus, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Bienvenido de nuevo, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Placeholder for charts or recent activity */}
      <div className="bg-white p-8 rounded-2xl border border-neutral-100 min-h-[400px] flex items-center justify-center text-gray-400 border-dashed border-2">
           Próximamente: Gráficos de actividad y registros por mes interactivos con PostHog.
      </div>
    </div>
  );
}
