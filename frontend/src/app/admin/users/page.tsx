'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import useSWR, { mutate } from 'swr';
import { Search, Trash2, ChevronLeft, ChevronRight, Shield, User as UserIcon, Eye, X, Calendar, Mail, Hash, Lock, Unlock, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { useDebounce } from '@/hooks/useDebounce';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

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
                <div className={`h-1.5 w-full bg-gradient-to-r ${user.is_blocked ? 'from-red-500 via-orange-500 to-red-400' : 'from-blue-600 via-indigo-500 to-blue-400'}`}></div>

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
                                <img src={user.foto_perfil} className={`w-24 h-24 rounded-full object-cover border-4 shadow-lg ${user.is_blocked ? 'border-red-100 shadow-red-500/20 grayscale' : 'border-white shadow-blue-500/20'}`} alt="" />
                            ) : (
                                <div className={`w-24 h-24 rounded-full text-[#223945] flex items-center justify-center font-bold text-3xl border-4 shadow-lg ${user.is_blocked ? 'bg-red-50 border-red-100 shadow-red-500/20' : 'bg-slate-100 border-white shadow-blue-500/20'}`}>
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
                                user.is_blocked ? 'bg-red-500' : (user.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400')
                            }`}>
                                {user.is_blocked && <Lock className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-[#223945] mb-1 flex items-center gap-2 justify-center">
                            {user.name}
                            {user.is_blocked && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">Bloqueado</span>}
                        </h2>
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
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Última Conexión</p>
                                <p className="text-sm font-semibold text-slate-700 capitalize">
                                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString('es-ES') : 'Nunca / Desconocido'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:border-blue-100 transition-colors">
                            <div className="p-2.5 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100">
                                <Hash className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fecha de Registro</p>
                                <p className="text-sm font-semibold text-slate-700">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500); // 500ms debounce
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Custom Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: number | null; userName: string; isDeleting: boolean }>({
    isOpen: false,
    userId: null,
    userName: '',
    isDeleting: false
  });

  const { data, error, isLoading } = useSWR(`/admin/users?page=${page}&search=${debouncedSearch}`, fetcher);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDeleteClick = (userId: number, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.userId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
        await api.delete(`/admin/users/${deleteModal.userId}`);
        mutate(`/admin/users?page=${page}&search=${debouncedSearch}`);
        setDeleteModal({ isOpen: false, userId: null, userName: '', isDeleting: false });
    } catch (e: any) {
        alert(e.response?.data?.message || 'Error al eliminar');
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
      try {
          await api.put(`/admin/users/${userId}/role`, { role: newRole });
          mutate(`/admin/users?page=${page}&search=${debouncedSearch}`);
      } catch (e: any) {
           alert(e.response?.data?.message || 'Error al cambiar rol');
      }
  };

  const handleBlockToggle = async (userId: number) => {
      setProcessingId(userId);
      try {
          await api.put(`/admin/users/${userId}/block`);
          mutate(`/admin/users?page=${page}&search=${debouncedSearch}`);
          if (selectedUser?.id === userId) {
             const updated = data?.data?.find((u:any) => u.id === userId);
             if(updated) setSelectedUser({...updated, is_blocked: !selectedUser.is_blocked}); 
          }
      } catch (e: any) {
          alert(e.response?.data?.message || 'Error al actualizar estado');
      } finally {
          setProcessingId(null);
      }
  };

  const handleResetPassword = async (userId: number) => {
      // For simplicity, we'll suggest a random password or prompt user.
      // Ideally, we open a prompt.
      const newPassword = prompt("Introduce la nueva contraseña provisional (mínimo 8 caracteres):");
      if (!newPassword) return;
      if (newPassword.length < 8) {
          alert("La contraseña debe tener al menos 8 caracteres.");
          return;
      }
      
      const confirmPassword = prompt("Confirma la nueva contraseña:");
      if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
      }

      setProcessingId(userId);
      try {
          await api.post(`/admin/users/${userId}/reset-password`, { 
              password: newPassword,
              password_confirmation: confirmPassword
          });
          alert("Contraseña actualizada correctamente.");
      } catch (e: any) {
          alert(e.response?.data?.message || 'Error al resetear contraseña');
      } finally {
          setProcessingId(null);
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
        {selectedUser && <UserDetailsModal key="user-details" user={selectedUser} onClose={() => setSelectedUser(null)} />}
        {deleteModal.isOpen && (
            <DeleteConfirmationModal 
                key="delete-modal"
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmDelete}
                title="Eliminar Usuario"
                isDeleting={deleteModal.isDeleting}
                description={
                    <span>
                        Estás a punto de eliminar al usuario <span className="font-bold text-slate-800">{deleteModal.userName}</span>.
                        <br /><br />
                        Esta acción <strong>no se puede deshacer</strong>. Se eliminará permanentemente su cuenta, acceso y cualquier dato asociado en la plataforma.
                    </span>
                }
            />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-[#223945] tracking-tight">Gestión de Usuarios</h1>
           <p className="text-slate-500 text-sm mt-1">Administra los roles, accesos y seguridad de la plataforma.</p>
        </div>
        <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar usuarios..." 
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945] outline-none w-full sm:w-72 transition-all bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalles</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data?.data?.map((user: any) => (
                        <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors group ${user.is_blocked ? 'bg-red-50/30' : ''}`}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {user.foto_perfil ? (
                                            <img src={user.foto_perfil} className={`w-10 h-10 rounded-full object-cover border ${user.is_blocked ? 'border-red-200 grayscale' : 'border-slate-200'}`} alt="" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-[#223945]'}`}>
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        {user.is_blocked ? (
                                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-0.5 rounded-full border-2 border-white">
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        ) : user.role === 'admin' ? (
                                            <div className="absolute -bottom-1 -right-1 bg-[#223945] text-white p-0.5 rounded-full border-2 border-white">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className={user.is_blocked ? 'opacity-60' : ''}>
                                        <span className={`font-bold block text-sm ${user.is_blocked ? 'text-red-700' : 'text-[#223945]'}`}>{user.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">ID: #{user.id}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-600 text-sm font-medium">{user.email}</span>
                                    <span className="text-[10px] text-slate-400">Reg: {new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {user.id === currentUser?.id ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                        Admin (Tú)
                                    </span>
                                ) : (
                                    <select 
                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border-0 ring-1 ring-inset focus:ring-2 focus:ring-[#223945] outline-none cursor-pointer transition-all ${
                                            user.role === 'admin' 
                                                ? 'bg-[#223945]/5 text-[#223945] ring-[#223945]/20' 
                                                : 'bg-slate-50 text-slate-600 ring-slate-200 hover:ring-slate-300'
                                        }`}
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={user.is_blocked}
                                    >
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {user.is_blocked ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wide">
                                        <Lock className="w-3 h-3" />
                                        Bloqueado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Activo
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <button 
                                        onClick={() => setSelectedUser(user)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Ver detalles"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    
                                    {user.id !== currentUser?.id && user.role !== 'admin' && (
                                        <>
                                            <button 
                                                onClick={() => handleResetPassword(user.id)}
                                                className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                title="Resetear Contraseña"
                                            >
                                                {processingId === user.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={() => handleBlockToggle(user.id)}
                                                className={`p-1.5 rounded-lg transition-all ${user.is_blocked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                                title={user.is_blocked ? "Desbloquear" : "Bloquear"}
                                            >
                                                {user.is_blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(user.id, user.name)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
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
                 <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${user.is_blocked ? 'from-red-500 to-red-300' : 'from-[#223945] via-blue-500 to-blue-300'}`}></div>
                 
                 <div className="flex items-start justify-between mb-2">
                     <div className="flex items-center gap-3 w-full pr-8">
                        <div className="relative shrink-0">
                            {user.foto_perfil ? (
                                <img src={user.foto_perfil} className={`w-10 h-10 rounded-full object-cover border ${user.is_blocked ? 'border-red-200 grayscale' : 'border-slate-200'}`} alt="" />
                            ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.is_blocked ? 'bg-red-50 text-red-700' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-[#223945]'}`}>
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            {user.is_blocked ? (
                                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-0.5 rounded-full border-2 border-white">
                                    <Lock className="w-3 h-3" />
                                </div>
                            ) : user.role === 'admin' ? (
                                <div className="absolute -bottom-1 -right-1 bg-[#223945] text-white p-0.5 rounded-full border-2 border-white">
                                    <Shield className="w-3 h-3" />
                                </div>
                            ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`font-bold text-sm leading-tight line-clamp-1 ${user.is_blocked ? 'text-red-700' : 'text-[#223945]'}`}>{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 break-all">{user.email}</p>
                        </div>
                     </div>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                     <select 
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border-0 ring-1 ring-inset outline-none cursor-pointer transition-all ${
                            user.role === 'admin' 
                                ? 'bg-[#223945]/5 text-[#223945] ring-[#223945]/20' 
                                : 'bg-slate-50 text-slate-600 ring-slate-200 hover:ring-slate-300'
                        }`}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === currentUser?.id || user.is_blocked}
                    >
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                    </select>

                     <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedUser(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                            <Eye className="w-5 h-5" />
                        </button>
                        {user.id !== currentUser?.id && user.role !== 'admin' && (
                            <>
                                <button onClick={() => handleResetPassword(user.id)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-100">
                                    <Key className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleBlockToggle(user.id)} className={`p-2 rounded-lg transition-all border border-transparent ${user.is_blocked ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100'}`}>
                                    {user.is_blocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </button>
                                <button onClick={() => handleDeleteClick(user.id, user.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
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
