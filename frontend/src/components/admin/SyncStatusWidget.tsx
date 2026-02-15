'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import api from '@/lib/axios';
import { RefreshCw, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SyncStatusWidget() {
  const { data, error, isLoading } = useSWR('/admin/dashboard/sync-status', fetcher, { refreshInterval: 5000 });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleForceSync = async () => {
    try {
      setIsSyncing(true);
      await api.post('/admin/dashboard/force-sync');
      mutate('/admin/dashboard/sync-status');
    } catch (error) {
      console.error('Failed to start sync', error);
      alert('Error al iniciar la sincronización. Puede que ya haya una en curso.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <div className="h-32 bg-white rounded-xl shadow-sm animate-pulse"></div>;
  if (error) return <div className="h-32 bg-white rounded-xl shadow-sm p-4 text-red-500">Error cargando estado.</div>;

  const latest = data?.latest;
  const isRunning = latest?.status === 'running';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative p-6 h-full flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 ${isRunning ? 'animate-spin text-blue-500' : 'text-slate-400'}`} />
            Estado de Sincronización
          </h3>
          <p className="text-sm text-slate-500">Datos abiertos de JCyL</p>
        </div>
        
        <button
          onClick={handleForceSync}
          disabled={isRunning || isSyncing}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2
            ${isRunning || isSyncing 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}
          `}
        >
          {isRunning || isSyncing ? (
            <>Sincronizando...</>
          ) : (
            <>Sincronizar Ahora</>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
         {latest ? (
             <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <span className={`
                        text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                        ${latest.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                        ${latest.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
                        ${latest.status === 'running' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                        {latest.status === 'success' && 'Completado'}
                        {latest.status === 'failed' && 'Error'}
                        {latest.status === 'running' && 'En ejecución'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(latest.started_at).toLocaleString()}
                    </span>
                </div>
                
                {/* Visual Progress Bar */}
                {isRunning && (
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden shrink-0">
                        <div className="bg-blue-500 h-1.5 rounded-full w-1/2 animate-[sidebar-loading_1s_ease-in-out_infinite]"></div>
                    </div>
                )}
                
                {latest.log && (
                   <div className="flex-1 overflow-y-auto bg-white p-2 rounded border border-slate-200 scrollbar-thin scrollbar-thumb-slate-200 min-h-0">
                       <pre className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap">{latest.log}</pre>
                   </div>
                )}
             </div>
         ) : (
             <div className="flex-1 flex items-center justify-center text-sm text-slate-400 italic">
                 No hay registros de sincronización.
             </div>
         )}
      </div>
    </div>
  );
}
