'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import useSWR, { mutate } from 'swr';
import { Search, Trash2, ChevronLeft, ChevronRight, Shield, User as UserIcon, Eye, X, Calendar, Mail, Hash } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// User Details Modal Component
// User Details Modal Component
function UserDetailsModal({ user, onClose }: { user: any; onClose: () => void }) {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             {/* Backdrop */}
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg z-10 flex flex-col max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            >
                {/* Top Gradient Border */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <h3 className="text-xl font-bold text-[#223945]">Ficha de Usuario</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* User Profile Summary */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="relative mb-4">
                             {user.foto_perfil ? (
                                <img src={user.foto_perfil} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg shadow-blue-500/20" alt="" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-slate-100 text-[#223945] flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg shadow-blue-500/20">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${user.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-[#223945] mb-1">{user.name}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${
                                user.role === 'admin' 
                                    ? 'bg-[#223945] text-white border-[#223945]' 
                                    : 'bg-green-50 text-green-700 border-green-200'
                            }`}>
                                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                            <span className="text-slate-400 text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">ID: {user.id}</span>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid gap-3">
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:border-blue-100 transition-colors">
                            <div className="p-2.5 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Correo Electrónico</p>
                                <p className="text-sm font-semibold text-slate-700 truncate" title={user.email}>{user.email}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:border-blue-100 transition-colors">
                            <div className="p-2.5 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fecha de Registro</p>
                                <p className="text-sm font-semibold text-slate-700 capitalize">
                                    {new Date(user.created_at).toLocaleDateString('es-ES', { 
                                        dateStyle: 'full'
                                    })}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    a las {new Date(user.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:border-blue-100 transition-colors">
                            <div className="p-2.5 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100">
                                <Hash className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Identificador Sistema</p>
                                <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 block text-slate-600">
                                    {user.id}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { data, error, isLoading } = useSWR(`/admin/users?page=${page}&search=${search}`, fetcher);

  const handleDelete = async (userId: number, userName: string) => {
      if(!confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName}? Esta acción no se puede deshacer.`)) return;

      try {
          await api.delete(`/admin/users/${userId}`);
          mutate(`/admin/users?page=${page}&search=${search}`);
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
      <AnimatePresence>
        {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>

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

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
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
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => setSelectedUser(user)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Ver detalles"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
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

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {data?.data?.map((user: any) => (
             <div key={user.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative p-4">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
                 
                 <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                            {user.foto_perfil ? (
                                <img src={user.foto_perfil} className="w-12 h-12 rounded-full object-cover border border-slate-200" alt="" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-[#223945] flex items-center justify-center font-bold text-lg">
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
                            <p className="font-bold text-[#223945]">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                     </div>
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                        <span className="w-1 h-1 rounded-full bg-green-500"></span> Activo
                     </span>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                     <div className="flex-1 mr-4">
                          {user.id === currentUser?.id ? (
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">Admin (Tú)</span>
                            ) : (
                                <select 
                                    className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-bold border-0 ring-1 ring-inset focus:ring-2 focus:ring-[#223945] outline-none transition-all ${
                                        user.role === 'admin' 
                                            ? 'bg-[#223945]/5 text-[#223945] ring-[#223945]/20' 
                                            : 'bg-slate-50 text-slate-600 ring-slate-200'
                                    }`}
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            )}
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <button 
                             onClick={() => setSelectedUser(user)}
                             className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                          >
                              <Eye className="w-5 h-5" />
                          </button>
                         {user.id !== currentUser?.id && user.role !== 'admin' && (
                             <button 
                                onClick={() => handleDelete(user.id, user.name)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                             >
                                 <Trash2 className="w-5 h-5" />
                             </button>
                         )}
                     </div>
                 </div>
             </div>
        ))}

        {/* Mobile Pagination */}
        <div className="flex items-center justify-between pt-4">
             <button 
                disabled={!data?.prev_page_url} 
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 disabled:opacity-50"
            >
                Anterior
            </button>
             <span className="text-xs font-bold text-slate-500">
                Pág. {page}
            </span>
            <button 
                disabled={!data?.next_page_url} 
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 disabled:opacity-50"
            >
                Siguiente
            </button>
        </div>
      </div>
    </div>
  );
}
