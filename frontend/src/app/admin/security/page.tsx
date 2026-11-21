'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import {
  ShieldAlert, Ban, Unlock, ChevronLeft, ChevronRight, Clock, Plus, X, ShieldCheck
} from 'lucide-react';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SecurityPage() {
  const [ipsPage, setIpsPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ ip: '', reason: '', permanent: false, hours: 24 });
  const [submitting, setSubmitting] = useState(false);

  const { data: stats } = useSWR('/admin/security/stats', fetcher, { refreshInterval: 30000 });
  const { data: ipsData, mutate: mutateIps } = useSWR(`/admin/security/blocked-ips?page=${ipsPage}`, fetcher);
  const { data: eventsData } = useSWR(`/admin/security/events?page=${eventsPage}`, fetcher);

  const blockedIps = ipsData?.data || [];
  const events = eventsData?.data || [];

  const unblock = async (id: number) => {
    if (!confirm('¿Desbloquear esta IP?')) return;
    await api.delete(`/admin/security/blocked-ips/${id}`);
    mutateIps();
  };

  const submitBlock = async () => {
    if (!blockForm.ip) return;
    setSubmitting(true);
    try {
      await api.post('/admin/security/blocked-ips', blockForm);
      setShowBlockModal(false);
      setBlockForm({ ip: '', reason: '', permanent: false, hours: 24 });
      mutateIps();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al bloquear la IP.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#223945] tracking-tight">Seguridad</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">IPs bloqueadas y eventos de seguridad reales.</p>
        </div>
        <button
          onClick={() => setShowBlockModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#223945] text-white hover:bg-[#1a2c36] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Bloquear IP
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-6 relative overflow-hidden min-w-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
          <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tight md:tracking-widest mb-1 leading-tight break-words">Bloqueos hoy</p>
          <p className="text-xl md:text-4xl font-black text-red-600">{stats?.blocked_attempts_today ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-6 relative overflow-hidden min-w-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
          <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tight md:tracking-widest mb-1 leading-tight break-words">IPs bloqueadas activas</p>
          <p className="text-xl md:text-4xl font-black text-[#223945]">{stats?.unique_ips_blocked ?? '—'}</p>
        </div>
      </div>

      {/* Blocked IPs table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Ban className="w-5 h-5 text-red-500" />
          <h3 className="text-base md:text-lg font-bold text-[#223945]">IPs Bloqueadas</h3>
        </div>
        {/* Mobile: cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {blockedIps.map((b: any) => (
            <div key={b.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-sm font-bold text-[#223945] break-all">{b.ip}</span>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  b.blocked_by === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {b.blocked_by === 'admin' ? (b.admin?.name || 'Admin') : 'Sistema'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{b.reason || 'Sin motivo especificado'}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {b.blocked_until ? `Hasta ${new Date(b.blocked_until).toLocaleString('es-ES')}` : 'Bloqueo permanente'}
              </p>
              <button
                onClick={() => unblock(b.id)}
                className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" /> Desbloquear
              </button>
            </div>
          ))}
          {blockedIps.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400 italic">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No hay IPs bloqueadas actualmente.
            </div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">Motivo</th>
                <th className="px-6 py-3">Bloqueado por</th>
                <th className="px-6 py-3">Hasta</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blockedIps.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs font-bold text-[#223945]">{b.ip}</td>
                  <td className="px-6 py-3 text-xs text-slate-600">{b.reason || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      b.blocked_by === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {b.blocked_by === 'admin' ? (b.admin?.name || 'Admin') : 'Sistema'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-500">
                    {b.blocked_until ? new Date(b.blocked_until).toLocaleString('es-ES') : 'Permanente'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => unblock(b.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <Unlock className="w-3 h-3" /> Desbloquear
                    </button>
                  </td>
                </tr>
              ))}
              {blockedIps.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No hay IPs bloqueadas actualmente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {ipsData?.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button onClick={() => setIpsPage(p => Math.max(1, p - 1))} disabled={ipsPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500">Página {ipsPage} de {ipsData.last_page}</span>
            <button onClick={() => setIpsPage(p => Math.min(ipsData.last_page, p + 1))} disabled={ipsPage === ipsData.last_page} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Security events */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          <h3 className="text-base md:text-lg font-bold text-[#223945]">Eventos de Seguridad Recientes</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {events.map((ev: any) => (
            <div key={ev.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {ev.action?.replace('SECURITY_', '')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{ev.ip_address}</span>
                </div>
                <p className="text-xs text-slate-600">{ev.description}</p>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" /> {new Date(ev.created_at).toLocaleString('es-ES')}
              </span>
            </div>
          ))}
          {events.length === 0 && (
            <p className="p-12 text-center text-slate-400 italic text-sm">Sin eventos de seguridad registrados.</p>
          )}
        </div>
        {eventsData?.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button onClick={() => setEventsPage(p => Math.max(1, p - 1))} disabled={eventsPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500">Página {eventsPage} de {eventsData.last_page}</span>
            <button onClick={() => setEventsPage(p => Math.min(eventsData.last_page, p + 1))} disabled={eventsPage === eventsData.last_page} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Block IP modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowBlockModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 relative z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-[#223945]">Bloquear IP manualmente</h3>
                <button onClick={() => setShowBlockModal(false)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dirección IP</label>
                  <input
                    type="text"
                    value={blockForm.ip}
                    onChange={(e) => setBlockForm({ ...blockForm, ip: e.target.value })}
                    placeholder="203.0.113.45"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Motivo</label>
                  <input
                    type="text"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                    placeholder="Actividad sospechosa"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945]"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={blockForm.permanent}
                    onChange={(e) => setBlockForm({ ...blockForm, permanent: e.target.checked })}
                    className="rounded"
                  />
                  Bloqueo permanente
                </label>
                {!blockForm.permanent && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Duración (horas)</label>
                    <input
                      type="number"
                      min={1}
                      value={blockForm.hours}
                      onChange={(e) => setBlockForm({ ...blockForm, hours: parseInt(e.target.value) || 24 })}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#223945]/20 focus:border-[#223945]"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowBlockModal(false)} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={submitBlock}
                  disabled={submitting || !blockForm.ip}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200 transition-all"
                >
                  {submitting ? 'Bloqueando...' : 'Bloquear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
