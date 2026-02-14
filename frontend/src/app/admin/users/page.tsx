'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import useSWR, { mutate } from 'swr';
import { Search, Trash2, Edit2, ShieldAlert } from 'lucide-react';
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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error al cargar usuarios. Asegúrate de tener permisos.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
           <p className="text-gray-500">Administra los roles y accesos de los usuarios registrados.</p>
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium text-sm uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4">Fecha Registro</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data?.data?.map((user: any) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {user.foto_perfil ? (
                                        <img src={user.foto_perfil} className="w-8 h-8 rounded-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-900">{user.name}</span>
                                    {user.id === currentUser?.id && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Tú</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
                            <td className="px-6 py-4">
                                <select 
                                    className={`px-3 py-1 rounded-lg text-sm font-medium border-none focus:ring-2 cursor-pointer ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                        user.role === 'editor' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    disabled={user.id === currentUser?.id}
                                >
                                    <option value="user">Usuario</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleDelete(user.id, user.name)}
                                    disabled={user.role === 'admin'}
                                    className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                    title="Eliminar usuario"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {data?.data?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                No se encontraron usuarios.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
                Mostrando {data?.from || 0} a {data?.to || 0} de {data?.total || 0} usuarios
            </span>
            <div className="flex gap-2">
                <button 
                    disabled={!data?.prev_page_url} 
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    Anterior
                </button>
                <button 
                    disabled={!data?.next_page_url} 
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
