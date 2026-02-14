'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import useSWR, { mutate } from 'swr';
import { Search, Trash2, ChevronLeft, ChevronRight, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223945]"></div>
    </div>
  );
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center">Error al cargar usuarios. Asegúrate de tener permisos.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-[#223945] tracking-tight">Gestión de Usuarios</h1>
           <p className="text-slate-500 text-sm mt-1">Administra los roles y el acceso a la plataforma.</p>
        </div>
        <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar usuarios..." 
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945] outline-none w-full sm:w-72 transition-all bg-white shadow-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
        {/* Decorative Top Gradient - matching Dashboard styling */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

        <div className="overflow-x-auto pt-2">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100/80">
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
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-[#223945] flex items-center justify-center font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        {user.role === 'admin' && (
                                            <div className="absolute -bottom-1 -right-1 bg-[#223945] text-white p-0.5 rounded-full border-2 border-white" title="Administrador">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#223945] block text-sm">{user.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">ID: #{user.id}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-slate-600 text-sm font-medium">{user.email}</span>
                            </td>
                            <td className="px-6 py-4">
                                {user.id === currentUser?.id ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                        Admin (Tú)
                                    </span>
                                ) : (
                                    <div className="relative">
                                        <select 
                                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border-0 ring-1 ring-inset focus:ring-2 focus:ring-[#223945] outline-none cursor-pointer transition-all ${
                                                user.role === 'admin' 
                                                    ? 'bg-[#223945]/5 text-[#223945] ring-[#223945]/20' 
                                                    : 'bg-slate-50 text-slate-600 ring-slate-200 hover:ring-slate-300'
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
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Activo
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1 pl-1 font-medium">
                                    {new Date(user.created_at).toLocaleDateString()}
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
                                    <p className="font-medium">No se encontraron usuarios.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
                Mostrando <span className="font-bold text-slate-700">{data?.from || 0}</span> a <span className="font-bold text-slate-700">{data?.to || 0}</span> de <span className="font-bold text-slate-700">{data?.total || 0}</span> resultados
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
