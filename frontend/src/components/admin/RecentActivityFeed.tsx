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
        
        // Translate Descriptions
        if (desc.includes('via google')) return 'Usuario accedió con Google';
        if (desc.includes('via github')) return 'Usuario accedió con GitHub';
        if (desc.includes('User logged in')) return 'Usuario inició sesión exitosamente';
        if (desc.includes('blocked')) return 'Usuario bloqueado por seguridad';
        if (desc.includes('unblocked')) return 'Usuario desbloqueado';
        if (desc.includes('Deleted user')) return 'Usuario eliminado del sistema';
        
        return desc; 
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
       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
       
       <div className="p-6 pb-2 mb-2 flex justify-between items-center shrink-0">
           <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
               <Activity className="w-5 h-5 text-blue-600" />
               Actividad del Sistema
           </h3>
           
           <div className="relative">
               <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer hover:bg-slate-100"
               >
                   <option value="all">Todo</option>
                   <option value="login">Accesos</option>
                   <option value="security">Seguridad</option>
                   <option value="system">Sistema</option>
               </select>
               <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
               </div>
           </div>
       </div>
       
       <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-200">
           {filteredData?.map((log: any) => (
               <div key={log.id} className="flex gap-3 group">
                   <div className="mt-1.5 min-w-[32px] h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-200 transition-colors">
                       {getIcon(log.action)}
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="flex flex-col">
                           <p className="text-sm font-medium text-[#223945] flex items-center flex-wrap gap-x-2">
                               <span className="font-bold">{log.user?.name || 'Sistema'}</span>
                               {log.user?.email && (
                                   <span className="text-xs font-normal text-slate-400">({log.user.email})</span>
                               )}
                           </p>
                           <p className="text-xs text-slate-500 mt-0.5">{getSpanishText(log)}</p>
                       </div>
                       
                       <div className="flex items-center gap-2 mt-1.5">
                           <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                               {new Date(log.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {log.ip_address && (
                               <span className="text-[10px] text-slate-300 font-mono opacity-60">
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
