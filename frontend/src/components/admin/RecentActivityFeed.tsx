'use client';

import useSWR from 'swr';
import api from '@/lib/axios';
import { Activity, User, Shield, AlertTriangle, Settings, RefreshCw, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function RecentActivityFeed() {
  const { data, error, isLoading } = useSWR('/admin/dashboard/activity', fetcher);

  if (isLoading) return <div className="h-64 bg-white rounded-xl shadow-sm animate-pulse"></div>;
  if (error) return <div className="text-red-500">Error cargando actividad.</div>;

  const getIcon = (action: string) => {
      if (action.includes('login')) return <User className="w-4 h-4 text-green-500" />;
      if (action.includes('block')) return <Shield className="w-4 h-4 text-red-500" />;
      if (action.includes('delete')) return <Trash2 className="w-4 h-4 text-red-500" />;
      if (action.includes('update')) return <Edit className="w-4 h-4 text-blue-500" />;
      if (action.includes('sync')) return <RefreshCw className="w-4 h-4 text-purple-500" />;
      if (action.includes('clear_cache')) return <Settings className="w-4 h-4 text-orange-500" />;
      return <Activity className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col">
       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>
       
       <div className="p-6 pb-0 mb-4 flex justify-between items-center">
           <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
               <Activity className="w-5 h-5 text-indigo-500" />
               Actividad del Sistema
           </h3>
           <Link href="/admin/activity" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md">
               Ver todo
           </Link>
       </div>
       
       <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
           {data?.data?.map((log: any) => (
               <div key={log.id} className="flex gap-3 group">
                   <div className="mt-1 min-w-[32px] h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                       {getIcon(log.action)}
                   </div>
                   <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-[#223945]">
                           <span className="font-bold">{log.user?.name || 'Sistema'}</span>{' '}
                           <span className="text-slate-600 font-normal">{log.description}</span>
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
           {(!data?.data || data.data.length === 0) && (
               <p className="text-slate-400 italic text-center text-sm py-4">No hay actividad reciente.</p>
           )}
       </div>
    </div>
  );
}
