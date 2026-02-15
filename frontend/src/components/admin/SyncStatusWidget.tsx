'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import api from '@/lib/axios';
import { RefreshCw, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SyncStatusWidget() {
  const { data, error, isLoading, mutate } = useSWR('/admin/dashboard/sync-status', fetcher, { refreshInterval: 5000 });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleForceSync = async () => {
    try {
      setIsSyncing(true);
      await api.post('/admin/dashboard/force-sync');
      mutate();
    } catch (error) {
      console.error('Failed to start sync', error);
      alert('Error al iniciar la sincronización.');
    } finally {
      setIsSyncing(false);
    }
  };

  const latest = data?.latest;
  const isRunning = latest?.status === 'running';

  // Helper to parse log lines for better styling
  const renderLogLine = (line: string, index: number) => {
      if (!line.trim()) return null;
      const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed');
      const isSuccess = line.toLowerCase().includes('synced') || line.toLowerCase().includes('completed');
      
      return (
          <div key={index} className="flex gap-2 text-[10px] font-mono mb-1.5 border-b border-slate-50 pb-1 last:border-0 last:mb-0">
             <span className="text-slate-300 min-w-[14px] select-none">{index + 1}</span>
             <span className={`${isError ? 'text-red-500 font-bold' : isSuccess ? 'text-green-600 font-bold' : 'text-slate-600'}`}>
                 {line}
             </span>
          </div>
      );
  };

  if (isLoading) return <div className="h-full bg-white rounded-xl shadow-sm animate-pulse"></div>;
  if (error) return <div className="h-full bg-white rounded-xl shadow-sm p-4 text-red-500">Error cargando estado.</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative p-6 h-full flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
      {/* Top Gradient matching Quick Actions */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isRunning ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                 {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
             </div>
             <div>
                <h3 className="text-lg font-bold text-[#223945]">Sincronización</h3>
                <p className="text-xs text-slate-500 font-medium">Datos de JCyL Open Data</p>
             </div>
        </div>
        
        <button
          onClick={handleForceSync}
          disabled={isRunning || isSyncing}
          className={`
            px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border
            ${isRunning || isSyncing 
              ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' 
              : 'bg-[#223945] text-white border-[#223945] hover:bg-[#1a2c36] hover:shadow-md'}
          `}
        >
          {isRunning || isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-slate-50 rounded-xl border border-slate-100 p-4 relative overflow-hidden">
         {/* Status Header inside the console box */}
         <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
             <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : latest?.status === 'failed' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                 <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {isRunning ? 'PROCESANDO' : latest?.status === 'failed' ? 'ERROR DE SINCRONIZACIÓN' : 'SISTEMA ACTUALIZADO'}
                 </span>
             </div>
             {latest?.started_at && (
                 <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                     <Clock className="w-3 h-3" />
                     {new Date(latest.started_at).toLocaleTimeString()}
                 </span>
             )}
         </div>

         {/* Logs Area */}
         <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
            {latest?.log ? (
                latest.log.split('\n').map((line: string, i: number) => renderLogLine(line, i))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <CheckCircle className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">Logs limpios</span>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
