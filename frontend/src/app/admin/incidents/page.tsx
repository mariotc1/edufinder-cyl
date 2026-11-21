'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import {
  CheckCircle, EyeOff, Trash2, ChevronLeft, ChevronRight,
  Clock, Hash, FileCode, Globe
} from 'lucide-react';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

type StatusFilter = 'open' | 'resolved' | 'ignored' | '';

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: '',         label: 'Todas' },
  { id: 'open',     label: 'Abiertas' },
  { id: 'resolved', label: 'Resueltas' },
  { id: 'ignored',  label: 'Ignoradas' },
];

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-red-50 text-red-600 border-red-100',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  ignored: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function IncidentsPage() {
  const [status, setStatus] = useState<StatusFilter>('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: stats } = useSWR('/admin/incidents/stats', fetcher, { refreshInterval: 30000 });
  const { data, isLoading, mutate } = useSWR(
    `/admin/incidents?page=${page}${status ? `&status=${status}` : ''}`,
    fetcher
  );

  const incidents = data?.data || [];
  const lastPage = data?.last_page || 1;

  const updateStatus = async (id: number, newStatus: 'resolved' | 'ignored' | 'open') => {
    await api.patch(`/admin/incidents/${id}/status`, { status: newStatus });
    mutate();
  };

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar esta incidencia definitivamente?')) return;
    await api.delete(`/admin/incidents/${id}`);
    mutate();
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#223945] tracking-tight">Incidencias</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">
          Errores reales de la aplicación, agrupados automáticamente.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-6">
        {[
          { label: 'Abiertas', value: stats?.open, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Resueltas', value: stats?.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Últimas 24h', value: stats?.last_24h, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-6 relative overflow-hidden min-w-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
            <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tight md:tracking-widest mb-1 leading-tight break-words">{card.label}</p>
            <p className={`text-xl md:text-4xl font-black ${card.color}`}>{card.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex bg-white rounded-xl border border-slate-100 shadow-sm p-1 w-full md:w-fit overflow-x-auto scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setStatus(tab.id); setPage(1); }}
            className={`shrink-0 whitespace-nowrap px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              status === tab.id ? 'bg-[#223945] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#223945]" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CheckCircle className="w-10 h-10 mb-3 opacity-50" />
            <p className="italic text-sm">No hay incidencias{status ? ` ${STATUS_TABS.find(t => t.id === status)?.label.toLowerCase()}` : ''}.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incidents.map((inc: any) => (
              <div key={inc.id} className="p-4 md:p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                    className="text-left flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[inc.status]}`}>
                        {inc.status === 'open' ? 'ABIERTA' : inc.status === 'resolved' ? 'RESUELTA' : 'IGNORADA'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {inc.occurrences}×
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(inc.last_seen_at).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#223945] truncate">{inc.exception_class}</p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{inc.message || 'Sin mensaje'}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1 truncate">
                      <FileCode className="w-3 h-3 shrink-0" /> {inc.file}:{inc.line}
                    </p>
                    {inc.url && (
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                        <Globe className="w-3 h-3 shrink-0" /> {inc.method} {inc.url}
                      </p>
                    )}
                  </button>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {inc.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(inc.id, 'resolved')}
                        title="Marcar como resuelta"
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {inc.status !== 'ignored' && (
                      <button
                        onClick={() => updateStatus(inc.id, 'ignored')}
                        title="Ignorar"
                        className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => remove(inc.id)}
                      title="Eliminar"
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expanded === inc.id && inc.trace && (
                  <pre className="mt-3 p-3 bg-slate-900 text-emerald-400 text-[10px] font-mono rounded-xl overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {inc.trace}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {lastPage > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500">Página {page} de {lastPage}</span>
            <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
