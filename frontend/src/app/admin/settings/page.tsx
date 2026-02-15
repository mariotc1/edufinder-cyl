'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import { Settings, Server, Database, Activity, RefreshCw, Power, AlertTriangle, FileText, CheckCircle, Terminal, Cpu, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SettingsPage() {
  const { data: systemStatus, error, isLoading, mutate } = useSWR('/admin/system/status', fetcher);
  const { data: logsData } = useSWR('/admin/system/logs', fetcher);
  const logs = logsData?.logs || [];

  const [clearingCache, setClearingCache] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  /* Pagination Logic */
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  
  const paginatedLogs = logs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* Modal Logic */
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);

  const handleClearCache = () => {
      setShowCacheModal(true);
  };

  const confirmClearCache = async () => {
    setShowCacheModal(false);
    setClearingCache(true);
    try {
      await api.post('/admin/system/clear-cache');
      // alert('Caché del sistema limpiada correctamente.'); // Removed in favor of UI feedback if needed, or keep for now
      mutate();
    } catch (error) {
      alert('Error al limpiar la caché.');
    } finally {
      setClearingCache(false);
    }
  };

  const confirmToggleMaintenance = async () => {
    setShowMaintenanceModal(false);
    setTogglingMaintenance(true);
    try {
        const isMaintenance = systemStatus?.maintenance_mode;
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
    <div className="space-y-8 pb-10 relative">
        {/* Custom Modal for Maintenance */}
        {showMaintenanceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
                    <div className="p-6 text-center">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isMaintenanceMode ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                            <Power className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-[#223945] mb-2">
                            {isMaintenanceMode ? '¿Reactivar el Sitio?' : '¿Activar Modo Mantenimiento?'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {isMaintenanceMode 
                                ? 'El sitio volverá a ser visible para todos los usuarios. ¿Estás seguro?' 
                                : 'El sitio no será accesible para los usuarios hasta que lo desactives. Solo los administradores podrán acceder.'}
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowMaintenanceModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmToggleMaintenance}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105 ${isMaintenanceMode ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-[#223945] hover:bg-[#1a2c36] shadow-slate-300'}`}
                            >
                                {isMaintenanceMode ? 'Sí, Reactivar' : 'Sí, Activar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Custom Modal for Cache */}
        {showCacheModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
                    <div className="p-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-orange-50 text-orange-500">
                            <RefreshCw className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-[#223945] mb-2">
                            ¿Limpiar Caché del Sistema?
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Esta acción eliminará la caché de configuración, rutas y vistas compiladas. Puede ralentizar ligeramente la primera carga posterior.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowCacheModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmClearCache}
                                className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-200"
                            >
                                Sí, Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

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
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-amber-500 shadow-sm">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cola de Trabajos</p>
                                <p className={`font-bold text-xs ${systemStatus?.failed_jobs_count > 0 ? 'text-red-500' : 'text-[#223945]'}`}>
                                    {systemStatus?.failed_jobs_count || 0} Fallidos
                                </p>
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
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold border border-amber-200">ACTIVO</span>
                            </div>
                        ) : (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold border border-emerald-100">INACTIVO</span>
                        )}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isMaintenanceMode ? 'text-amber-900' : 'text-[#223945]'}`}>
                        Mantenimiento
                    </h3>
                    <p className={`text-xs mb-4 ${isMaintenanceMode ? 'text-amber-700' : 'text-slate-500'}`}>
                        {isMaintenanceMode ? 'El sitio está actualmente cerrado al público.' : 'El sitio es totalmente visible.'}
                    </p>
                    
                    <ul className="space-y-2 mb-6">
                        <li className={`flex items-center gap-2 text-[10px] font-medium ${isMaintenanceMode ? 'text-amber-800' : 'text-slate-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isMaintenanceMode ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                            {isMaintenanceMode ? 'Solo administradores pueden acceder' : 'Acceso público habilitado'}
                        </li>
                        <li className={`flex items-center gap-2 text-[10px] font-medium ${isMaintenanceMode ? 'text-amber-800' : 'text-slate-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                            {isMaintenanceMode ? 'Mensaje de "Volvemos pronto"' : 'Todas las funciones activas'}
                        </li>
                    </ul>
                </div>

                <button
                    onClick={() => setShowMaintenanceModal(true)}
                    disabled={togglingMaintenance}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isMaintenanceMode 
                            ? 'bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50' 
                            : 'bg-[#223945] text-white hover:bg-[#1a2c36]'
                    }`}
                >
                    {togglingMaintenance ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                    {isMaintenanceMode ? 'Desactivar Modo Mantenimiento' : 'Activar Modo Mantenimiento'}
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
                         <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-[10px] font-bold border border-slate-200">OPTIMIZACIÓN</span>
                     </div>
                     <h3 className="text-lg font-bold text-[#223945] mb-2">Limpiar Caché</h3>
                     <p className="text-xs text-slate-500 mb-4">
                        Elimina archivos temporales para aplicar cambios.
                     </p>
                     
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                            <CheckCircle className="w-3 h-3 text-orange-500" />
                            Configuración del Sistema
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                            <CheckCircle className="w-3 h-3 text-orange-500" />
                            Caché de Rutas y Vistas
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                            <CheckCircle className="w-3 h-3 text-orange-500" />
                            Eventos y Listeners
                        </li>
                    </ul>
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
                Mostrando {paginatedLogs.length} de {logs.length} registros
            </div>
        </div>
        
        {/* Mobile View (Cards) */}
        <div className="block md:hidden">
            {paginatedLogs.map((log: any) => (
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
                    {paginatedLogs.map((log: any) => (
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
                    {paginatedLogs.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                No hay registros de auditoría disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold text-slate-500">
                    Página {currentPage} de {totalPages}
                </div>
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>
    </div>
  );

}
