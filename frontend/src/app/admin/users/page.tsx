'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import useSWR, { mutate } from 'swr';
import { Search, Trash2, Edit2, ShieldAlert, ChevronLeft, ChevronRight, MoreVertical, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(`/admin/users?page=${page}&search=${search}`, fetcher);

  const handleDelete = async (userId: number, userName: string) => {
      if(!confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName}? Esta acción no se puede deshacer.`)) return;

      try {
          await api.delete(`/admin/users/${userId}`);
          mutate(`/admin/users?page=${page}&search=${search}`); // Refresh data
          alert('Usuario eliminado');
      } catch (e: any) {
          alert(e.response?.data?.message || 'Error al eliminar');
      }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
      try {
          await api.put(`/admin/users/${userId}/role`, { role: newRole });
          mutate(`/admin/users?page=${page}&search=${search}`);
      } catch (e: any) {
           alert(e.response?.data?.message || 'Error al cambiar rol');
      }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center">Error al cargar usuarios. Asegúrate de tener permisos.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-[#223945] tracking-tight">Gestión de Usuarios</h1>
           <p className="text-slate-500 text-sm">Administra los roles y el acceso a la plataforma.</p>
        </div>
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar usuarios..." 
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-full sm:w-72 transition-all bg-white shadow-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalles de Contacto</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol de Sistema</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data?.data?.map((user: any) => (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {user.foto_perfil ? (
                                            <img src={user.foto_perfil} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        {user.role === 'admin' && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white" title="Administrador">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-800 block">{user.name}</span>
                                        <span className="text-xs text-slate-400">ID: #{user.id}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-slate-600 text-sm">{user.email}</span>
                            </td>
                            <td className="px-6 py-4">
                                {user.id === currentUser?.id ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Admin (Tú)
                                    </span>
                                ) : (
                                    <div className="relative">
                                        <select 
                                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium border-0 ring-1 ring-inset focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer transition-all ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-50 text-purple-700 ring-purple-600/20' 
                                                    : 'bg-slate-50 text-slate-700 ring-slate-200 hover:ring-slate-300'
                                            }`}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <ChevronLeft className="h-3 w-3 -rotate-90" />
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Activo
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1 pl-1">
                                    Reg: {new Date(user.created_at).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleDelete(user.id, user.name)}
                                        disabled={user.role === 'admin'}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                                        title="Eliminar usuario"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data?.data?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <UserIcon className="w-8 h-8 text-slate-300" />
                                    <p>No se encontraron usuarios.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
                Mostrando <span className="font-medium text-slate-800">{data?.from || 0}</span> a <span className="font-medium text-slate-800">{data?.to || 0}</span> de <span className="font-medium text-slate-800">{data?.total || 0}</span> resultados
            </span>
            <div className="flex gap-2">
                <button 
                    disabled={!data?.prev_page_url} 
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button 
                    disabled={!data?.next_page_url} 
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
