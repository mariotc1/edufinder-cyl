'use client';

import useSWR from 'swr';
import api from '@/lib/axios';
import { Activity, User, Shield, AlertTriangle, Settings, RefreshCw, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function RecentActivityFeed() {
  const { data, error, isLoading } = useSWR('/admin/dashboard/activity', fetcher);
  const [filter, setFilter] = useState('all');

  if (isLoading) return <div className="h-full min-h-[300px] bg-white rounded-xl shadow-sm animate-pulse"></div>;
  if (error) return <div className="text-red-500">Error cargando actividad.</div>;

    const getIcon = (action: string) => {
      // Monochromatic Blue/Slate theme as requested
      if (action.includes('login') || action.includes('LOGIN')) return <User className="w-4 h-4 text-blue-600" />;
      if (action.includes('block') || action.includes('fail')) return <Shield className="w-4 h-4 text-blue-800" />;
      if (action.includes('delete')) return <Trash2 className="w-4 h-4 text-slate-500" />;
      if (action.includes('update')) return <Edit className="w-4 h-4 text-sky-500" />;
      if (action.includes('sync')) return <RefreshCw className="w-4 h-4 text-blue-400" />;
      if (action.includes('clear')) return <Settings className="w-4 h-4 text-slate-400" />;
      return <Activity className="w-4 h-4 text-slate-300" />;
    };

    const getSpanishText = (log: any) => {
        let action = log.action || '';
        let desc = log.description || '';

        // Translate Actions
        if (action === 'LOGIN') return 'Inicio de sesión';
        if (action === 'LOGIN_SOCIAL') return 'Inicio de sesión (Social)';
        if (action === 'REGISTER_SOCIAL') return 'Registro (Social)';
        if (action === 'LOGIN_FAILED_BLOCKED') return 'Acceso bloqueado';
        if (action === 'LOGOUT') return 'Cierre de sesión';
        
        // Translate Descriptions partially
        if (desc.includes('User logged in')) return 'Usuario inició sesión';
        if (desc.includes('blocked')) return 'Usuario bloqueado';
        if (desc.includes('unblocked')) return 'Usuario desbloqueado';
        if (desc.includes('Deleted user')) return 'Usuario eliminado';
        
        return desc; // Fallback
    };

    const filteredData = data?.data?.filter((log: any) => {
        if (filter === 'all') return true;
        const action = (log.action || '').toLowerCase();
        if (filter === 'login') return action.includes('login') || action.includes('logout');
        if (filter === 'security') return action.includes('block') || action.includes('fail') || action.includes('shield');
        if (filter === 'system') return action.includes('sync') || action.includes('cache') || action.includes('system');
        return true;
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col">
       {/* Blue Gradient matching other cards */}
       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
       
       <div className="p-6 pb-2 mb-2 flex justify-between items-center shrink-0">
           <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
               <Activity className="w-5 h-5 text-blue-600" />
               Actividad del Sistema
           </h3>
           
           <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 transition-colors"
           >
               <option value="all">Todo</option>
               <option value="login">Accesos</option>
               <option value="security">Seguridad</option>
               <option value="system">Sistema</option>
           </select>
       </div>
       
       <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
           {filteredData?.map((log: any) => (
               <div key={log.id} className="flex gap-3 group">
                   <div className="mt-1 min-w-[32px] h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-200 transition-colors">
                       {getIcon(log.action)}
                   </div>
                   <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-[#223945]">
                           <span className="font-bold">{log.user?.name || 'Sistema'}</span>{' '}
                           <span className="text-slate-600 font-normal">{getSpanishText(log)}</span>
                       </p>
                       <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] text-slate-400 font-mono">
                               {new Date(log.created_at).toLocaleString()}
                           </span>
                           {log.ip_address && (
                               <span className="text-[10px] text-slate-300 bg-slate-50 px-1 rounded border border-slate-100">
                                   {log.ip_address}
                               </span>
                           )}
                       </div>
                   </div>
               </div>
           ))}
           {(!filteredData || filteredData.length === 0) && (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-sm">
                   <Activity className="w-8 h-8 mb-2 opacity-20" />
                   No hay actividad reciente.
               </div>
           )}
       </div>
    </div>
  );
}
