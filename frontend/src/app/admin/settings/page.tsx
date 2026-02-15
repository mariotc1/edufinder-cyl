'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import { Settings, Server, Database, Activity, RefreshCw, Power, AlertTriangle, FileText, CheckCircle, Terminal, Cpu, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SettingsPage() {
  const { data: systemStatus, error, isLoading, mutate } = useSWR('/admin/system/status', fetcher);
  const { data: logsData } = useSWR('/admin/system/logs', fetcher);
  const logs = logsData?.logs || [];

  const [clearingCache, setClearingCache] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await api.post('/admin/system/clear-cache');
      alert('Caché del sistema limpiada correctamente.');
      mutate();
    } catch (error) {
      alert('Error al limpiar la caché.');
    } finally {
      setClearingCache(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const isMaintenance = systemStatus?.maintenance_mode;
    const action = isMaintenance ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${action} el modo de mantenimiento?`)) return;
    
    setTogglingMaintenance(true);
    try {
      await api.post('/admin/system/maintenance', { enable: !isMaintenance });
      mutate();
    } catch (error) {
      alert('Error al cambiar el modo de mantenimiento.');
    } finally {
      setTogglingMaintenance(false);
    }
  };

  if (isLoading) return (
      <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223945]"></div>
      </div>
  );

  const isMaintenanceMode = systemStatus?.maintenance_mode;


  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-[#223945] tracking-tight">Configuración del Sistema</h1>
        <p className="text-slate-500 mt-1 font-medium">Estado del sistema, auditoría y herramientas de mantenimiento.</p>
      </div>

      {/* Top Grid: 3 Columns Equal Height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* System Health Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Salud del Sistema
                </h3>
                
                <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-500 shadow-sm">
                                <Database className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base de Datos</p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${systemStatus?.database_connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <p className="font-bold text-[#223945] text-xs">{systemStatus?.database_connected ? 'Conectada' : 'Error'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-purple-500 shadow-sm">
                                <RefreshCw className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caché</p>
                                <p className="font-bold text-[#223945] text-xs uppercase">{systemStatus?.cache_driver}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Maintenance Mode Card */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden relative h-full flex flex-col transition-all duration-300 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] ${isMaintenanceMode ? 'bg-amber-50 border-amber-200' : 'bg-white border-neutral-200'}`}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${isMaintenanceMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                           <Power className="w-6 h-6" />
                        </div>
                        {isMaintenanceMode ? (
                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold border border-amber-200">ACTIVO</span>
                        ) : (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold border border-emerald-100">INACTIVO</span>
                        )}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isMaintenanceMode ? 'text-amber-900' : 'text-[#223945]'}`}>
                        Mantenimiento
                    </h3>
                    <p className={`text-xs mb-6 ${isMaintenanceMode ? 'text-amber-700' : 'text-slate-500'}`}>
                        {isMaintenanceMode ? 'Sitio cerrado al público.' : 'Sitio activo y visible.'}
                    </p>
                </div>

                <button
                    onClick={handleToggleMaintenance}
                    disabled={togglingMaintenance}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isMaintenanceMode 
                            ? 'bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50' 
                            : 'bg-[#223945] text-white hover:bg-[#1a2c36]'
                    }`}
                >
                    {togglingMaintenance ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                    {isMaintenanceMode ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        </div>

        {/* Cache Control Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-all duration-300">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
             <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                     <div className="flex items-center justify-between mb-4">
                         <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                            <RefreshCw className="w-6 h-6" />
                         </div>
                     </div>
                     <h3 className="text-lg font-bold text-[#223945] mb-2">Limpiar Caché</h3>
                     <p className="text-xs text-slate-500 mb-6">
                        Resuelve problemas de visualización y configuración.
                     </p>
                </div>
                <button
                    onClick={handleClearCache}
                    disabled={clearingCache}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                >
                    {clearingCache ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Limpiar Todo
                </button>
             </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Auditoría del Sistema
                </h3>
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                {logs.length} registros
            </div>
        </div>
        
        {/* Mobile View (Cards) */}
        <div className="block md:hidden">
            {logs.map((log: any) => (
                <div key={log.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] uppercase border border-blue-100">
                                {log.user ? log.user.substring(0, 2) : 'SY'}
                            </div>
                            <span className="text-xs font-bold text-[#223945]">{log.user}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{log.relative_time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {log.action}
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">{log.ip}</span>
                    </div>
                    <p className="text-xs text-slate-600">{log.description}</p>
                </div>
            ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
                    <tr>
                        <th className="px-6 py-3">Usuario</th>
                        <th className="px-6 py-3">Acción</th>
                        <th className="px-6 py-3">Descripción</th>
                        <th className="px-6 py-3">IP / Fecha</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase border border-blue-100">
                                        {log.user ? log.user.substring(0, 2) : 'SY'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#223945]">{log.user}</p>
                                        <p className="text-[10px] text-slate-400">{log.email || 'Sistema'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-600 font-medium">
                                {log.description}
                            </td>
                            <td className="px-6 py-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {log.relative_time}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ip}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                No hay registros de auditoría disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );

}
