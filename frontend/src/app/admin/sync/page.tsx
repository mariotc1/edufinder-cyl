'use client';

import { useState, Fragment } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import {
  RefreshCw, School, BookOpen, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Loader2,
  ChevronDown, PlusCircle, Pencil, ArrowRight
} from 'lucide-react';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const DATASET_META: Record<string, { label: string; icon: any }> = {
  centros: { label: 'Centros Docentes', icon: School },
  ciclos_fp: { label: 'Oferta de FP', icon: BookOpen },
};

function RunChanges({ runId }: { runId: number }) {
  const [page, setPage] = useState(1);
  const { data } = useSWR(`/admin/dashboard/sync-runs/${runId}/changes?page=${page}`, fetcher);
  const changes = data?.data || [];

  if (!data) {
    return <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;
  }

  if (changes.length === 0) {
    return <p className="p-6 text-center text-slate-400 italic text-xs">Esta ejecución no creó ni actualizó ningún registro.</p>;
  }

  return (
    <div className="bg-slate-50 border-t border-slate-100">
      <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
        {changes.map((c: any) => (
          <div key={c.id} className="px-6 py-3 flex items-start gap-3">
            {c.change_type === 'created' ? (
              <PlusCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <Pencil className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#223945]">
                {c.entity_label}
                <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  c.change_type === 'created' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {c.change_type === 'created' ? 'NUEVO' : 'ACTUALIZADO'}
                </span>
                <span className="ml-2 text-[9px] text-slate-400 uppercase">{DATASET_META[c.dataset]?.label || c.dataset}</span>
              </p>
              {c.changes && Object.keys(c.changes).length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {Object.entries(c.changes).map(([field, vals]: [string, any]) => (
                    <div key={field} className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-600">{field}:</span>
                      <span className="line-through text-red-400">{String(vals[0] ?? '—')}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="text-emerald-600 font-bold">{String(vals[1] ?? '—')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {data.last_page > 1 && (
        <div className="px-6 py-2 flex items-center justify-between border-t border-slate-200">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-[10px] font-bold text-slate-500 disabled:opacity-40">← Anterior</button>
          <span className="text-[10px] font-bold text-slate-400">Página {page} de {data.last_page}</span>
          <button onClick={() => setPage(p => Math.min(data.last_page, p + 1))} disabled={page === data.last_page} className="text-[10px] font-bold text-slate-500 disabled:opacity-40">Siguiente →</button>
        </div>
      )}
    </div>
  );
}

export default function SyncPage() {
  const [historyPage, setHistoryPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedRun, setExpandedRun] = useState<number | null>(null);

  const { data: overview, mutate: mutateOverview } = useSWR('/admin/dashboard/sync-overview', fetcher, { refreshInterval: 5000 });
  const { data: history } = useSWR(`/admin/dashboard/sync-history?page=${historyPage}`, fetcher, { refreshInterval: 5000 });

  const latest = overview?.latest;
  const isRunning = latest?.status === 'running';

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/admin/dashboard/force-sync');
      mutateOverview();
    } catch {
      alert('Error al iniciar la sincronización.');
    } finally {
      setIsSyncing(false);
    }
  };

  const renderLogLine = (line: string, index: number) => {
    if (!line.trim()) return null;
    const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed');
    const isSuccess = line.toLowerCase().includes('synced') || line.toLowerCase().includes('completed');
    return (
      <div key={index} className="flex gap-2 text-[10px] font-mono mb-1.5 border-b border-slate-800 pb-1 last:border-0 last:mb-0">
        <span className="text-slate-600 min-w-[14px] select-none">{index + 1}</span>
        <span className={isError ? 'text-red-400 font-bold' : isSuccess ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{line}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#223945] tracking-tight">Sincronización</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Datos abiertos de la Junta de Castilla y León.</p>
        </div>
        <button
          onClick={handleForceSync}
          disabled={isRunning || isSyncing}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
            isRunning || isSyncing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#223945] text-white hover:bg-[#1a2c36]'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRunning || isSyncing ? 'animate-spin' : ''}`} />
          Sincronizar ahora
        </button>
      </div>

      {/* Per-dataset cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(overview?.datasets || []).map((ds: any) => {
          const meta = DATASET_META[ds.dataset] || { label: ds.dataset, icon: RefreshCw };
          const Icon = meta.icon;
          return (
            <div key={ds.dataset} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative p-6">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Icon className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-[#223945]">{meta.label}</h3>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  ds.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : ds.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {ds.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : ds.status === 'failed' ? <XCircle className="w-3 h-3" /> : null}
                  {ds.status === 'completed' ? 'ACTUALIZADO' : ds.status?.toUpperCase() || 'SIN DATOS'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 text-center">
                <div className="bg-slate-50 rounded-xl p-2 md:p-3 border border-slate-100 min-w-0">
                  <p className="text-lg md:text-xl font-black text-[#223945]">{ds.records_processed ?? 0}</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tight md:tracking-wide mt-0.5 leading-tight">
                    <span className="md:hidden">Total</span>
                    <span className="hidden md:inline">Procesados</span>
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 md:p-3 border border-slate-100 min-w-0">
                  <p className="text-lg md:text-xl font-black text-emerald-600">{ds.records_created ?? 0}</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tight md:tracking-wide mt-0.5 leading-tight">Creados</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 md:p-3 border border-slate-100 min-w-0">
                  <p className="text-lg md:text-xl font-black text-blue-600">{ds.records_updated ?? 0}</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tight md:tracking-wide mt-0.5 leading-tight">
                    <span className="md:hidden">Modif.</span>
                    <span className="hidden md:inline">Actualizados</span>
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Última sincronización: {ds.last_sync_at ? new Date(ds.last_sync_at).toLocaleString('es-ES') : 'Nunca'}
              </p>
              {ds.error_message && (
                <p className="text-[10px] text-red-500 mt-1.5 bg-red-50 rounded-lg p-2 font-mono">{ds.error_message}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Live console */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#223945] mb-4">Ejecución actual</h3>
        <div className="bg-slate-900 rounded-xl p-4 min-h-[140px] max-h-80 overflow-y-auto">
          {isSyncing ? (
            <div className="h-full flex flex-col items-center justify-center text-blue-400 py-8 space-y-3">
              <Loader2 className="w-7 h-7 animate-spin opacity-60" />
              <span className="text-xs font-medium opacity-70">Iniciando proceso...</span>
            </div>
          ) : latest?.log ? (
            latest.log.split('\n').map((line: string, i: number) => renderLogLine(line, i))
          ) : (
            <p className="text-slate-500 text-xs italic text-center py-8">Sin ejecuciones registradas todavía.</p>
          )}
        </div>
      </div>

      {/* Full history */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base md:text-lg font-bold text-[#223945]">Historial completo</h3>
        </div>
        {/* Mobile: cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {(history?.data || []).map((run: any) => {
            const start = new Date(run.started_at);
            const end = run.ended_at ? new Date(run.ended_at) : null;
            const durationSec = end ? Math.round((end.getTime() - start.getTime()) / 1000) : null;
            const isOpen = expandedRun === run.id;
            const canExpand = run.changes_count > 0;
            return (
              <div key={run.id}>
                <button
                  onClick={() => canExpand && setExpandedRun(isOpen ? null : run.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      run.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : run.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {run.status?.toUpperCase()}
                    </span>
                    <p className="text-xs text-slate-600 mt-1.5">{start.toLocaleString('es-ES')}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {durationSec !== null ? `Duró ${durationSec}s` : 'En curso'} · {run.changes_count ?? 0} cambios
                    </p>
                  </div>
                  {canExpand && (
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 mt-1 ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>
                {isOpen && canExpand && <RunChanges runId={run.id} />}
              </div>
            );
          })}
          {(history?.data || []).length === 0 && (
            <p className="px-6 py-12 text-center text-slate-400 italic text-sm">Sin historial disponible.</p>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Inicio</th>
                <th className="px-6 py-3">Fin</th>
                <th className="px-6 py-3">Duración</th>
                <th className="px-6 py-3">Cambios</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(history?.data || []).map((run: any) => {
                const start = new Date(run.started_at);
                const end = run.ended_at ? new Date(run.ended_at) : null;
                const durationSec = end ? Math.round((end.getTime() - start.getTime()) / 1000) : null;
                const isOpen = expandedRun === run.id;
                return (
                  <Fragment key={run.id}>
                    <tr
                      onClick={() => setExpandedRun(isOpen ? null : run.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          run.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : run.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {run.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-600">{start.toLocaleString('es-ES')}</td>
                      <td className="px-6 py-3 text-xs text-slate-600">{end ? end.toLocaleString('es-ES') : '—'}</td>
                      <td className="px-6 py-3 text-xs font-mono text-slate-500">{durationSec !== null ? `${durationSec}s` : '—'}</td>
                      <td className="px-6 py-3 text-xs font-bold text-[#223945]">{run.changes_count ?? 0}</td>
                      <td className="px-6 py-3 text-right">
                        {run.changes_count > 0 && (
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                      </td>
                    </tr>
                    {isOpen && run.changes_count > 0 && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <RunChanges runId={run.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {(history?.data || []).length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Sin historial disponible.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {history?.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500">Página {historyPage} de {history.last_page}</span>
            <button onClick={() => setHistoryPage(p => Math.min(history.last_page, p + 1))} disabled={historyPage === history.last_page} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
