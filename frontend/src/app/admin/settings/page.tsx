'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import { Settings, Server, Database, Activity, RefreshCw, Power, AlertTriangle, FileText, CheckCircle, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SettingsPage() {
  const { data: systemStatus, error, isLoading, mutate } = useSWR('/admin/system/status', fetcher);
  const { data: logs } = useSWR('/admin/system/logs', fetcher);

  const [clearingCache, setClearingCache] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await api.post('/admin/system/clear-cache');
      alert('Caché del sistema limpiada correctamente.');
    } catch (error) {
      alert('Error al limpiar la caché.');
    } finally {
      setClearingCache(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!confirm('¿Estás seguro de cambiar el modo de mantenimiento?')) return;
    
    setTogglingMaintenance(true);
    try {
      await api.post('/admin/system/maintenance');
      mutate(); // Refresh status
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

  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error cargando configuración del sistema.</div>;

  const isMaintenanceMode = systemStatus?.maintenance_mode;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-[#223945] tracking-tight">Configuración del Sistema</h1>
        <p className="text-slate-500 mt-1 font-medium">Gestiona el estado y mantenimiento de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* System Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>
            <div className="p-6">
                <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2 mb-6">
                    <Server className="w-5 h-5 text-indigo-500" />
                    Estado del Servidor
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Versión de Laravel</p>
                                <p className="font-bold text-[#223945]">{systemStatus?.laravel_version}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Versión de PHP</p>
                                <p className="font-bold text-[#223945]">{systemStatus?.php_version}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                                <Database className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conexión a Base de Datos</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    <span className="font-bold text-green-600 text-sm">Conectado</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{systemStatus?.database_connection}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Maintenance & Cache Actions */}
        <div className="space-y-8">
            {/* Maintenance Mode */}
            <div className={`rounded-xl shadow-sm border overflow-hidden relative transition-all ${isMaintenanceMode ? 'bg-amber-50 border-amber-200' : 'bg-white border-neutral-200'}`}>
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isMaintenanceMode ? 'from-amber-400 via-orange-400 to-amber-500' : 'from-emerald-400 via-green-500 to-emerald-600'}`}></div>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className={`text-lg font-bold flex items-center gap-2 ${isMaintenanceMode ? 'text-amber-800' : 'text-[#223945]'}`}>
                            <Power className="w-5 h-5" />
                            Modo Mantenimiento
                        </h3>
                        {isMaintenanceMode ? (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> ACTIVO
                            </span>
                        ) : (
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> INACTIVO
                            </span>
                        )}
                    </div>
                    
                    <p className={`text-sm mb-6 ${isMaintenanceMode ? 'text-amber-700' : 'text-slate-500'}`}>
                        {isMaintenanceMode 
                            ? 'El sitio está actualmente inaccesible para los usuarios. Solo los administradores pueden acceder.' 
                            : 'El sitio está operativo y accesible para todo el público.'}
                    </p>

                    <button
                        onClick={handleToggleMaintenance}
                        disabled={togglingMaintenance}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            isMaintenanceMode 
                                ? 'bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 shadow-sm' 
                                : 'bg-[#223945] text-white hover:bg-[#1a2c36] shadow-lg shadow-[#223945]/20'
                        }`}
                    >
                        {togglingMaintenance ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Power className="w-4 h-4" />
                        )}
                        {isMaintenanceMode ? 'Desactivar Modo Mantenimiento' : 'Activar Modo Mantenimiento'}
                    </button>
                </div>
            </div>

            {/* Cache Control */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500"></div>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-orange-500" />
                        Caché del Sistema
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Limpia la caché de la aplicación, rutas, configuración y vistas. Útil si los cambios recientes no se reflejan.
                    </p>

                    <button
                        onClick={handleClearCache}
                        disabled={clearingCache}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all flex items-center justify-center gap-2"
                    >
                        {clearingCache ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {clearingCache ? 'Limpiando...' : 'Limpiar Toda la Caché'}
                    </button>
                </div>
            </div>
        </div>

        {/* System Logs (Full Width) */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#0f172a]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Logs del Sistema (Laravel)
                </h3>
                <span className="text-xs font-mono text-slate-400">últimas líneas</span>
            </div>
            <div className="p-0 overflow-hidden">
                <pre className="p-6 overflow-x-auto text-xs font-mono text-slate-300 h-96 custom-scrollbar whitespace-pre-wrap leading-relaxed">
                    {logs?.content || 'Cargando logs...'}
                </pre>
            </div>
        </div>

      </div>
    </div>
  );
}
