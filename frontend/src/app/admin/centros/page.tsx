'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import useSWR, { mutate } from 'swr';
import { Search, Trash2, ChevronLeft, ChevronRight, School, MapPin } from 'lucide-react';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function CentrosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(`/admin/centros?page=${page}&search=${debouncedSearch}`, fetcher);
  
  // Custom Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; centroId: number | null; nombre: string; isDeleting: boolean }>({
    isOpen: false,
    centroId: null,
    nombre: '',
    isDeleting: false
  });

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDeleteClick = (centroId: number, nombre: string) => {
    setDeleteModal({ isOpen: true, centroId, nombre, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.centroId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
        await api.delete(`/admin/centros/${deleteModal.centroId}`);
        mutate(`/admin/centros?page=${page}&search=${debouncedSearch}`);
        setDeleteModal({ isOpen: false, centroId: null, nombre: '', isDeleting: false });
    } catch (e: any) {
        alert(e.response?.data?.message || 'Error al eliminar');
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223945]"></div>
    </div>
  );
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center">Error al cargar centros.</div>;

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {deleteModal.isOpen && (
            <DeleteConfirmationModal 
                key="delete-modal"
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmDelete}
                title="Eliminar Centro"
                isDeleting={deleteModal.isDeleting}
                description={
                    <span>
                        Estás a punto de eliminar el centro <span className="font-bold text-slate-800">{deleteModal.nombre}</span>.
                        <br /><br />
                        Esta acción <strong>no se puede deshacer</strong>. Al eliminar este centro, desaparecerá de los listados y mapas, y se perderán todos las reseñas o datos asociados.
                    </span>
                }
            />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-[#223945] tracking-tight">Gestión de Centros</h1>
           <p className="text-slate-500 text-sm mt-1">Consulta y gestiona los centros educativos registrados.</p>
        </div>
        <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar por nombre, localidad..." 
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
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Centro</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data?.data?.map((centro: any) => (
                        <tr key={centro.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <School className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#223945] block text-sm line-clamp-1" title={centro.nombre}>{centro.nombre}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{centro.tipo_centro || 'Desconocido'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {centro.localidad}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                    {centro.codigo}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                    <button 
                                        onClick={() => handleDeleteClick(centro.id, centro.nombre)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Eliminar centro"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                     {data?.data?.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <School className="w-8 h-8 text-slate-300" />
                                    <p className="font-medium">No se encontraron centros.</p>
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
        {data?.data?.map((centro: any) => (
             <div key={centro.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative p-4">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
                 
                 <div className="flex items-start justify-between mb-2">
                     <div className="flex items-center gap-3 w-full pr-8">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <School className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#223945] text-sm leading-tight line-clamp-2">{centro.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{centro.tipo_centro || 'Desconocido'}</p>
                        </div>
                     </div>
                 </div>

                 <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {centro.localidad}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                         <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                            {centro.codigo}
                        </span>
                    </div>
                 </div>

                 <div className="flex items-center justify-end pt-3 border-t border-slate-100 mt-3">
                     <button 
                        onClick={() => handleDeleteClick(centro.id, centro.nombre)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-100"
                     >
                         <Trash2 className="w-3.5 h-3.5" />
                         Eliminar
                     </button>
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
