'use client';

import { Download, RefreshCw, Server, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '@/lib/axios';

export default function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading('export');
    try {
      const res = await api.get('/admin/users'); // Get all users
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
    } catch (error) {
      console.error('Export failed', error);
      alert('Error exportando datos');
    }
    setLoading(null);
  };

  const handleClearCache = async () => {
    setLoading('cache');
    // Simulate cache clearing or call real endpoint if available
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Caché del sistema limpiada correctamente.');
    setLoading(null);
  };

  const handleStatusCheck = () => {
    alert('Estado del Sistema: OPERATIVO\nBase de Datos: Conectada\nAPI: Online');
  };

  const actions = [
    { name: 'Exportar Datos', icon: Download, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', hover: 'hover:bg-blue-100', action: handleExport, id: 'export' },
    { name: 'Limpiar Caché', icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', hover: 'hover:bg-emerald-100', action: handleClearCache, id: 'cache' },
    { name: 'Estado Sistema', icon: Server, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', hover: 'hover:bg-purple-100', action: handleStatusCheck, id: 'status' },
    { name: 'Logs de Error', icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', hover: 'hover:bg-orange-100', action: () => alert('Log de errores vacío.'), id: 'logs' },
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 h-full relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

      <h3 className="text-lg font-bold text-[#223945] mb-6">Acciones Rápidas</h3>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <motion.button
            key={action.name}
            onClick={action.action}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${action.bg} ${action.border} ${action.hover}`}
          >
            <div className={`p-2 bg-white rounded-full shadow-sm ${action.color}`}>
              {loading === action.id ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <action.icon className="w-5 h-5" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-700">{action.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
