'use client';

import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, WifiOff, LogIn, UserPlus, Scale, Map as MapIcon, GraduationCap, Building2, Search, Compass, Check, X } from 'lucide-react';
import CentroCard from '@/components/CentroCard';
import CentroCardSkeleton from '@/components/CentroCardSkeleton';
import RecommendationsSection from '@/components/recommendations/RecommendationsSection';
import PullToRefresh from '@/components/PullToRefresh';
import { BrandBackdrop } from '@/components/auth/AuthLayout';
import { Centro, CicloFP } from '@/types';
import axios from '@/lib/axios';
import { toggleCicloFavorite } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useComparison } from '@/context/ComparisonContext';
import { centroName, centroLugar, nivelFP } from '@/lib/centro-format';

const fetcher = async (url: string) => (await axios.get(url)).data;

type CicloGuardado = { id: number; ciclo_id: number; ciclo: CicloFP & { centro: Centro } };
type Tab = 'centros' | 'ciclos';

export default function FavoritosContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { replaceComparison } = useComparison();
    const [tab, setTab] = useState<Tab>('centros');
    // Modo "elegir para comparar": null = desactivado; si no, ids marcados (máx. 3)
    const [picked, setPicked] = useState<number[] | null>(null);

    // Sin sesión no se pide nada al backend: se muestra la invitación a entrar
    const { data, error, isLoading, mutate } = useSWR(user ? '/favoritos' : null, fetcher, {
        revalidateOnFocus: true,
        shouldRetryOnError: false,
    });
    const { data: ciclosData, mutate: mutateCiclos } = useSWR<CicloGuardado[]>(user ? '/ciclos-favoritos' : null, fetcher, {
        revalidateOnFocus: true,
        shouldRetryOnError: false,
    });

    const centros: Centro[] = useMemo(() => {
        const raw = Array.isArray(data) ? data : (data?.data || []);
        return raw.map((item: { centro: Centro }) => item.centro).filter(Boolean);
    }, [data]);

    const ciclos = useMemo(() => (Array.isArray(ciclosData) ? ciclosData : []).filter(c => c.ciclo), [ciclosData]);

    // Ciclos guardados de cada centro (se destacan en su tarjeta)
    const ciclosPorCentro = useMemo(() => {
        const m = new globalThis.Map<number, number[]>();
        ciclos.forEach(c => m.set(c.ciclo.centro_id, [...(m.get(c.ciclo.centro_id) ?? []), c.ciclo_id]));
        return m;
    }, [ciclos]);

    const handleToggle = () => { setTimeout(() => mutate(), 500); };
    const handleRefresh = useCallback(async () => { await Promise.all([mutate(), mutateCiclos()]); }, [mutate, mutateCiclos]);

    const quitarCiclo = async (cicloId: number) => {
        mutateCiclos(prev => (prev ?? []).filter(c => c.ciclo_id !== cicloId), { revalidate: false });
        try { await toggleCicloFavorite(cicloId); } finally { mutateCiclos(); }
    };

    const compararCentros = (ids: number[]) => {
        replaceComparison(centros.filter(c => ids.includes(c.id)));
        router.push(`/comparador?centros=${ids.join(',')}`);
    };

    // Con 2 favoritos no hay nada que elegir; con más, el usuario decide cuáles
    const empezarComparacion = () => {
        if (centros.length === 2) return compararCentros(centros.map(c => c.id));
        setTab('centros');
        setPicked(centros.length === 3 ? centros.map(c => c.id) : []);
    };

    const togglePicked = (id: number) => setPicked(prev => {
        if (!prev) return prev;
        if (prev.includes(id)) return prev.filter(x => x !== id);
        return prev.length >= 3 ? prev : [...prev, id];
    });

    const loading = authLoading || (!!user && isLoading);
    const resumen = [
        `${centros.length} ${centros.length === 1 ? 'centro' : 'centros'}`,
        `${ciclos.length} ${ciclos.length === 1 ? 'ciclo' : 'ciclos'}`,
    ].join(' · ');

    return (
        <div className="relative isolate min-h-screen bg-brand-gradient pt-6 md:pt-12 pb-12 px-4 sm:px-6">
            <PullToRefresh onRefresh={handleRefresh} />
            <BrandBackdrop pattern={false} />

            <div className="max-w-7xl mx-auto">
                {!authLoading && !user ? (
                    <CenteredCard>
                        <div className="w-20 h-20 bg-gradient-to-br from-rose-50 to-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Heart className="w-9 h-9 text-red-500 fill-red-500" />
                        </div>
                        <h2 className="!text-2xl font-bold text-[#223945] mb-2">Guarda lo que te interesa</h2>
                        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                            Entra para guardar centros y ciclos, compararlos y recibir recomendaciones según tus gustos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/login?redirect=/favoritos" className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-[#223945] to-blue-700 text-white rounded-full font-bold shadow-lg shadow-[#223945]/25 active:scale-95 transition-all">
                                <LogIn className="w-4 h-4" /> Iniciar sesión
                            </Link>
                            <Link href="/registro?redirect=/favoritos" className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-[#223945] border border-neutral-200 rounded-full font-bold active:scale-95 transition-all">
                                <UserPlus className="w-4 h-4" /> Crear cuenta
                            </Link>
                        </div>
                    </CenteredCard>
                ) : error ? (
                    <CenteredCard>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <WifiOff className="w-9 h-9 text-red-400" />
                        </div>
                        <h2 className="!text-2xl font-bold text-[#223945] mb-2">No hemos podido cargar tus favoritos</h2>
                        <p className="text-neutral-500 mb-8">Revisa tu conexión e inténtalo de nuevo.</p>
                        <button onClick={() => mutate()} className="inline-flex items-center gap-2 px-8 py-3 bg-[#223945] text-white rounded-full font-bold hover:-translate-y-0.5 transition-all">
                            Reintentar
                        </button>
                    </CenteredCard>
                ) : (
                    <>
                        {/* ── Cabecera ── */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-rose-400/40 blur-xl" />
                                    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 ring-4 ring-white shadow-lg shadow-rose-500/25 flex items-center justify-center">
                                        <Heart className="w-7 h-7 md:w-8 md:h-8 text-white fill-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="!text-[1.75rem] md:!text-4xl !font-extrabold tracking-tight !text-[#223945] !leading-tight">Mis favoritos</h1>
                                    <p className="!text-sm md:!text-base !text-neutral-500 font-medium">
                                        {loading ? 'Cargando tu lista…' : centros.length || ciclos.length ? `Tu lista: ${resumen}` : 'Tu lista corta para decidir'}
                                    </p>
                                </div>
                            </div>

                            {centros.length > 0 && (
                                <div className="flex gap-2">
                                    {centros.length >= 2 && (
                                        <button
                                            type="button"
                                            onClick={empezarComparacion}
                                            disabled={picked !== null}
                                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white border border-neutral-200 text-[#223945] text-sm font-bold shadow-sm hover:border-[#223945]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            <Scale className="w-4 h-4 text-blue-600" />
                                            Comparar
                                        </button>
                                    )}
                                    <Link
                                        href="/mapa?favoritos=1"
                                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white border border-neutral-200 text-[#223945] text-sm font-bold shadow-sm hover:border-[#223945]/30 hover:-translate-y-0.5 transition-all"
                                    >
                                        <MapIcon className="w-4 h-4 text-blue-600" />
                                        Ver en el mapa
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* ── Centros | Ciclos ── */}
                        <div role="tablist" aria-label="Tipo de favorito" className="inline-flex p-1 mb-6 rounded-2xl bg-white/70 border border-white shadow-sm">
                            {([
                                { key: 'centros', label: 'Centros', icon: Building2, count: centros.length },
                                { key: 'ciclos', label: 'Ciclos', icon: GraduationCap, count: ciclos.length },
                            ] as const).map(t => {
                                const active = tab === t.key;
                                return (
                                    <button
                                        key={t.key}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => { setTab(t.key); setPicked(null); }}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                                            active ? 'bg-gradient-to-r from-[#223945] to-blue-700 text-white shadow-md shadow-[#223945]/20' : 'text-neutral-500 hover:text-[#223945]'
                                        }`}
                                    >
                                        <t.icon className="w-4 h-4" />
                                        {t.label}
                                        <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center ${active ? 'bg-white/20' : 'bg-neutral-100'}`}>
                                            {t.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.18 }}
                            >
                                {tab === 'centros' && (
                                    loading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[...Array(3)].map((_, i) => <CentroCardSkeleton key={i} />)}
                                        </div>
                                    ) : centros.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {centros.map((centro, index) => {
                                                const orden = picked?.indexOf(centro.id) ?? -1;
                                                return (
                                                    <CentroCard
                                                        key={centro.id}
                                                        centro={centro}
                                                        index={index}
                                                        initialIsFavorite={true}
                                                        onToggle={handleToggle}
                                                        ciclosFavoritosIds={ciclosPorCentro.get(centro.id) ?? []}
                                                        seleccion={picked ? {
                                                            orden: orden >= 0 ? orden + 1 : null,
                                                            bloqueada: picked.length >= 3 && orden < 0,
                                                            onToggle: () => togglePicked(centro.id),
                                                        } : undefined}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Building2}
                                            title="Aún no has guardado centros"
                                            text="Pulsa el corazón de cualquier centro para tenerlo aquí, compararlo y verlo en el mapa."
                                            primary={{ href: '/', label: 'Buscar centros', icon: Search }}
                                            secondary={{ href: '/descubre-tu-fp', label: '¿No sabes qué estudiar?', icon: Compass }}
                                        />
                                    )
                                )}

                                {tab === 'ciclos' && (
                                    ciclos.length > 0 ? (
                                        <ul className="grid gap-3 md:grid-cols-2">
                                            {ciclos.map(({ ciclo }) => {
                                                const nivel = nivelFP(ciclo.nivel_educativo);
                                                const distancia = ciclo.modalidad && !ciclo.modalidad.toLowerCase().startsWith('presencial');
                                                const nivelParam = nivel ? (nivel.abbr === 'FPB' ? 'BASICA' : nivel.abbr) : null;
                                                return (
                                                    <li key={ciclo.id} className="relative flex items-stretch rounded-2xl bg-white border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-[#223945]/25 transition-all overflow-hidden">
                                                        <span aria-hidden="true" className={`w-1.5 shrink-0 ${nivel?.solid.split(' ')[0] ?? 'bg-neutral-400'}`} />
                                                        <Link href={`/centro/${ciclo.centro_id}${nivelParam ? `?nivel=${nivelParam}` : ''}`} className="flex-1 min-w-0 p-4">
                                                            <span className="flex items-center gap-2 flex-wrap">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${nivel?.solid ?? 'bg-neutral-600 text-white'}`}>
                                                                    {nivel?.label ?? ciclo.nivel_educativo}
                                                                </span>
                                                                {distancia && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#223945]/[0.07] text-[#223945]">A distancia</span>
                                                                )}
                                                            </span>
                                                            <span className="mt-1.5 block text-base font-extrabold text-[#111827] leading-snug">{ciclo.ciclo_formativo}</span>
                                                            <span className="block text-xs text-neutral-500 mt-0.5">{ciclo.familia_profesional}</span>
                                                            <span className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-[#223945] min-w-0">
                                                                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                                <span className="truncate">{centroName(ciclo.centro)}</span>
                                                                <span className="text-neutral-400 font-medium truncate">· {centroLugar(ciclo.centro)}</span>
                                                            </span>
                                                        </Link>
                                                        <button
                                                            onClick={() => quitarCiclo(ciclo.id)}
                                                            aria-label="Quitar ciclo de favoritos"
                                                            className="self-start m-3 w-9 h-9 shrink-0 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors"
                                                        >
                                                            <Heart className="w-4 h-4 fill-current" />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <EmptyState
                                            icon={GraduationCap}
                                            title="Aún no has guardado ciclos"
                                            text="Dentro de cada centro, pulsa el corazón de un ciclo de FP para guardarlo aquí junto a dónde se imparte."
                                            primary={{ href: '/?tipo=FP', label: 'Explorar ciclos de FP', icon: Search }}
                                            secondary={{ href: '/descubre-tu-fp', label: 'Descubre tu FP', icon: Compass }}
                                        />
                                    )
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Barra de selección para comparar (portal: por encima de toda la interfaz flotante) */}
                        {typeof document !== 'undefined' && createPortal(<AnimatePresence>
                            {picked && (
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 24 }}
                                    className="fixed z-[120] inset-x-3 bottom-[calc(var(--bottom-nav-height)+0.75rem)] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:w-[30rem]"
                                >
                                    <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl bg-[#223945] text-white shadow-[0_20px_50px_-12px_rgba(34,57,69,0.6)] ring-1 ring-white/10">
                                        <div className="flex-1 min-w-0">
                                            <p className="!text-sm !font-extrabold !text-white !leading-tight">
                                                {picked.length < 2 ? 'Elige 2 o 3 centros' : `${picked.length} centros elegidos`}
                                            </p>
                                            <span className="flex gap-1 mt-1.5" aria-hidden="true">
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} className={`h-1 w-6 rounded-full transition-colors ${i < picked.length ? 'bg-blue-400' : 'bg-white/20'}`} />
                                                ))}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPicked(null)}
                                            aria-label="Cancelar comparación"
                                            className="w-10 h-10 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => compararCentros(picked)}
                                            disabled={picked.length < 2}
                                            className="h-10 shrink-0 px-4 rounded-xl bg-white text-[#223945] text-sm font-extrabold flex items-center gap-1.5 shadow-md disabled:opacity-40 transition-opacity"
                                        >
                                            <Scale className="w-4 h-4" />
                                            Comparar
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>, document.body)}

                        {/* Recomendaciones según la lista */}
                        {centros.length > 0 && (
                            <div className="mt-12">
                                <RecommendationsSection />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative text-center py-14 px-6 bg-white/85 backdrop-blur-xl rounded-3xl border border-white/70 shadow-[0_24px_60px_-20px_rgba(34,57,69,0.35)] max-w-lg mx-auto mt-8 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
            {children}
        </div>
    );
}

function EmptyState({ icon: Icon, title, text, primary, secondary }: {
    icon: typeof Heart;
    title: string;
    text: string;
    primary: { href: string; label: string; icon: typeof Heart };
    secondary: { href: string; label: string; icon: typeof Heart };
}) {
    return (
        <div className="flex flex-col items-center text-center px-6 py-14 rounded-3xl bg-white/70 border border-white shadow-sm">
            <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-[#223945]/25">
                <Icon className="w-7 h-7" />
            </span>
            <h2 className="mt-5 !text-xl !font-extrabold !text-[#223945]">{title}</h2>
            <p className="mt-1.5 !text-sm text-neutral-500 max-w-sm">{text}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <Link href={primary.href} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-sm font-bold shadow-lg shadow-[#223945]/20 hover:-translate-y-0.5 transition-all">
                    <primary.icon className="w-4 h-4" />
                    {primary.label}
                </Link>
                <Link href={secondary.href} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-white border border-neutral-200 text-[#223945] text-sm font-bold hover:border-[#223945]/30 transition-all">
                    <secondary.icon className="w-4 h-4 text-blue-600" />
                    {secondary.label}
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
            </div>
        </div>
    );
}
