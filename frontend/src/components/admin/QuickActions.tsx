'use client';

import { Download, RefreshCw, Server, ShieldAlert, CheckCircle, AlertTriangle, Database, Activity, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '@/lib/axios';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null);
  
  // Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Data Fetching for Modals (Conditional)
  const { data: systemStatus, mutate: refreshStatus } = useSWR(showStatusModal ? '/admin/system/status' : null, fetcher);
  
  // We'll fetch logs only when modal is open to save resources
  const { data: logsData, mutate: refreshLogs } = useSWR(showLogsModal ? '/admin/system/logs' : null, fetcher);

  const handleExport = async () => {
    setLoading('export');
    try {
      const res = await api.get('/admin/users'); // Get all users
      // Check structure, might be paginated or wrapped
      const users = res.data.data || res.data; 
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Email,Role,Created At\n"
        + users.map((u: any) => `${u.id},"${u.name}",${u.email},${u.role},${u.created_at}`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed', error);
      alert('Error exportando datos');
    } finally {
        setLoading(null);
    }
  };

  const handleClearCache = async () => {
    setLoading('cache');
    try {
        await api.post('/admin/system/clear-cache');
        // Wait a bit to show loading state
        await new Promise(resolve => setTimeout(resolve, 800));
        setShowCacheModal(false);
        // Maybe refresh status if we had it
        refreshStatus();
    } catch (error) {
        alert('Error limpiando caché');
    } finally {
        setLoading(null);
    }
  };

  const actions = [
    { 
        name: 'Exportar Datos', 
        icon: Download, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        border: 'border-blue-100', 
        hover: 'hover:bg-blue-100', 
        action: () => setShowExportModal(true), 
        id: 'export' 
    },
    { 
        name: 'Limpiar Caché', 
        icon: RefreshCw, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-100', 
        hover: 'hover:bg-emerald-100', 
        action: () => setShowCacheModal(true), 
        id: 'cache' 
    },
    { 
        name: 'Estado Sistema', 
        icon: Server, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        border: 'border-purple-100', 
        hover: 'hover:bg-purple-100', 
        action: () => setShowStatusModal(true), 
        id: 'status' 
    },
    { 
        name: 'Logs de Error', 
        icon: ShieldAlert, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-100', 
        hover: 'hover:bg-orange-100', 
        action: () => setShowLogsModal(true), 
        id: 'logs' 
    },
  ];

  return (
    <>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 h-full relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
        {/* Top Gradient Border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

        <h3 className="text-lg font-bold text-[#223945] mb-6">Acciones Rápidas</h3>

        <div className="flex-1 flex flex-col justify-center min-h-0">
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action) => (
                <motion.button
                    key={action.name}
                    onClick={action.action}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`h-24 w-full rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${action.bg} ${action.border} ${action.hover}`}
                >
                    <div className={`p-2 bg-white rounded-full shadow-sm ${action.color}`}>
                        <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wide text-center leading-tight w-full px-2 truncate">
                        {action.name}
                    </span>
                </motion.button>
                ))}
            </div>
        </div>
        </div>

        {/* MODALS */}
        <AnimatePresence>
            {/* EXPORT MODAL */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-50 text-blue-500">
                                <Download className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-[#223945] mb-2">Exportar Usuarios</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Se generará un archivo CSV con la información de todos los usuarios registrados.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowExportModal(false)} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200">Cancelar</button>
                                <button 
                                    onClick={handleExport} 
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                >
                                    {loading === 'export' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download className="w-4 h-4" />}
                                    Descargar CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CACHE MODAL */}
            {showCacheModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-orange-50 text-orange-500">
                                <RefreshCw className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-[#223945] mb-2">Limpiar Caché</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Esto eliminará la caché de configuración y vistas. Útil si hay cambios que no se reflejan.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCacheModal(false)} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200">Cancelar</button>
                                <button 
                                    onClick={handleClearCache} 
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                                >
                                    {loading === 'cache' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <RefreshCw className="w-4 h-4" />}
                                    Limpiar Todo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STATUS MODAL */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-[#223945] flex items-center gap-2">
                                    <Server className="w-6 h-6 text-purple-500" />
                                    Estado del Sistema
                                </h3>
                                <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {!systemStatus ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-500">
                                                <Database className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase">Base de Datos</p>
                                                <p className="font-bold text-[#223945]">
                                                    {systemStatus.database_connected ? 'Conectada Correctamente' : 'Error de Conexión'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${systemStatus.database_connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-purple-500">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase">Entorno</p>
                                                <p className="font-bold text-[#223945]">{systemStatus.environment || 'production'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                                            PHP {systemStatus.php_version}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-amber-500">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase">Trabajos Fallidos</p>
                                                <p className={`font-bold ${systemStatus.failed_jobs_count > 0 ? 'text-red-600' : 'text-[#223945]'}`}>
                                                    {systemStatus.failed_jobs_count} en cola
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                        <p className="text-xs text-slate-400">
                                            Última comprobación: {new Date().toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LOGS MODAL */}
            {showLogsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-[#223945] flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    Logs del Sistema (Últimas líneas)
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Muestra el contenido reciente de laravel.log</p>
                            </div>
                            <button onClick={() => setShowLogsModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-0 bg-slate-900">
                            {!logsData ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </div>
                            ) : (
                                <pre className="p-4 text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                    {logsData.logs && logsData.logs.length > 0 
                                        ? logsData.logs.join('\n') 
                                        : <span className="text-slate-500 italic">-- El archivo de log está vacío o no se ha podido leer --</span>
                                    }
                                </pre>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                            <button onClick={() => setShowLogsModal(false)} className="px-6 py-2 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AnimatePresence>
    </>
  );
}
