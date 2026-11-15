'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Search, Heart, MapPin, Hand, ChevronRight, ChevronLeft, X, PartyPopper, UserPlus, Compass, Palette,
  Share2, Scale, Check, Database, GraduationCap, Building2, MousePointerClick, type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { estiloDeTipo } from '@/lib/centro-estilo';
import { NIVELES_FP } from '@/lib/centro-format';
import type { TourStep } from './tourSteps';

interface TourTooltipProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
  isActive: boolean;
}

const iconMap: Record<NonNullable<TourStep['icon']>, LucideIcon> = {
  sparkles: Sparkles,
  search: Search,
  heart: Heart,
  map: MapPin,
  'hand-wave': Hand,
  party: PartyPopper,
  compass: Compass,
  palette: Palette,
};

const TOOLTIP_WIDTH = 380;

// ── Piezas de contenido ──

// Barra de progreso por segmentos + "Paso 2 de 7"
function Progreso({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 flex gap-1" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className="h-1 flex-1 rounded-full bg-neutral-200 overflow-hidden">
            <motion.span
              className="block h-full rounded-full bg-gradient-to-r from-[#223945] to-blue-600"
              initial={false}
              animate={{ width: i <= actual ? '100%' : '0%' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </span>
        ))}
      </div>
      <span className="text-[11px] font-bold text-neutral-400 tabular-nums whitespace-nowrap">
        {actual + 1} de {total}
      </span>
    </div>
  );
}

// Leyenda: tipos de centro, titularidad y niveles de FP
const TIPOS_LEYENDA = ['Centro de FP', 'Instituto', 'Colegio', 'Escuela infantil', 'Música y danza', 'Educación especial'];
const NOMBRE_CORTO: Record<string, string> = {
  'Centro de FP': 'FP', 'Instituto': 'Instituto', 'Colegio': 'Colegio',
  'Escuela infantil': 'Infantil', 'Música y danza': 'Música', 'Educación especial': 'Especial',
};

function Leyenda() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {TIPOS_LEYENDA.map((t, i) => {
          const e = estiloDeTipo(t);
          const Icon = e.icon;
          return (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className={`flex items-center gap-1.5 p-1.5 rounded-xl bg-gradient-to-br ${e.header} to-white ring-1 ring-black/[0.04]`}
            >
              <span className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${e.tile} text-white flex items-center justify-center shadow-sm`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className={`text-[11px] font-extrabold truncate ${e.text}`}>{NOMBRE_CORTO[t]}</span>
            </motion.span>
          );
        })}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider w-[4.75rem] shrink-0">Titularidad</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-600 text-white">Público</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-amber-950">Privado</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider w-[4.75rem] shrink-0">Nivel FP</span>
        {NIVELES_FP.map(n => (
          <span key={n.key} title={n.label} className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${n.solid}`}>{n.abbr}</span>
        ))}
        <span className="text-[10px] text-neutral-400 font-medium">Básico → Especialización</span>
      </div>
    </div>
  );
}

// Qué hace cada botón de la tarjeta
function Acciones() {
  const filas: { icon: LucideIcon; tone: string; title: string; text: string }[] = [
    { icon: Heart, tone: 'bg-rose-50 text-rose-500', title: 'Favorito', text: 'Tu lista corta, siempre a mano' },
    { icon: Share2, tone: 'bg-[#223945]/[0.07] text-[#223945]', title: 'Compartir', text: 'Por WhatsApp o con un enlace' },
    { icon: Scale, tone: 'bg-blue-50 text-blue-600', title: 'Comparar', text: 'Hasta 3 centros, lado a lado' },
    { icon: MousePointerClick, tone: 'bg-emerald-50 text-emerald-600', title: 'Toca la tarjeta', text: 'Ficha con ciclos, contacto y ruta' },
  ];
  return (
    <ul className="grid grid-cols-2 gap-1.5">
      {filas.map((f, i) => (
        <motion.li
          key={f.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          className="flex items-start gap-2 p-2 rounded-xl bg-neutral-50"
        >
          <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${f.tone}`}>
            <f.icon className="w-3.5 h-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-extrabold text-[#223945] leading-tight">{f.title}</span>
            <span className="block text-[10.5px] text-neutral-500 leading-snug">{f.text}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

// Cuerpo común de los pasos anclados a un elemento (escritorio y hoja inferior en móvil)
function CuerpoPaso({ step, Icon, actual, total, onNext, onPrev, onSkip, compacto }: {
  step: TourStep; Icon: LucideIcon | null; actual: number; total: number;
  onNext: () => void; onPrev: () => void; onSkip: () => void; compacto?: boolean;
}) {
  return (
    <>
      <button
        onClick={onSkip}
        className="absolute top-3 right-3 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors z-10"
        aria-label="Cerrar el tour"
      >
        <X className="w-4 h-4" />
      </button>

      <div className={compacto ? 'px-4 pt-4 pb-4' : 'px-5 pt-5 pb-5'}>
        <div className="flex items-center gap-3 pr-8">
          {Icon && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#223945] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-[#223945]/25"
            >
              <Icon className="w-5 h-5" />
            </motion.span>
          )}
          <h3 className="!text-[17px] !font-extrabold !text-[#223945] !leading-tight">{step.title}</h3>
        </div>
        <p className="mt-2.5 !text-sm !text-neutral-600 !leading-relaxed">{step.description}</p>

        {step.extra && (
          <div className="mt-3.5">
            {step.extra === 'leyenda' ? <Leyenda /> : <Acciones />}
          </div>
        )}

        <div className="mt-4">
          <Progreso actual={actual} total={total} />
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3">
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1 px-2 py-2 text-sm font-semibold text-neutral-500 hover:text-[#223945] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>
          <motion.button
            onClick={onNext}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-sm font-bold shadow-lg shadow-[#223945]/25"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </>
  );
}

// Cabecera de marca para las pantallas de bienvenida y final
function HeroMarca({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#16262f] via-[#223945] to-blue-700 px-6 pt-8 pb-7 text-center">
      <div aria-hidden="true" className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.45),transparent_70%)]" />
      <div aria-hidden="true" className="absolute -bottom-20 -left-12 w-52 h-52 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

// ── Componente principal ──

export default function TourTooltip({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onSkip,
  onPrev,
  isActive,
}: TourTooltipProps) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [desktopPosition, setDesktopPosition] = useState<{ top: number; left: number } | null>(null);
  const [elementNotFound, setElementNotFound] = useState(false);
  const [mobileElementNotFound, setMobileElementNotFound] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isWelcome = step.isWelcomeStep === true;
  const isFinalStep = step.isFinalStep === true;
  const isCenteredStep = !step.targetSelector || step.placement === 'center';

  useEffect(() => {
    const updateViewport = () => {
      setViewportHeight(window.visualViewport?.height || window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('resize', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

  // Posición en escritorio junto al elemento (usa la altura real del tooltip)
  useLayoutEffect(() => {
    if (!isActive || isMobile || isCenteredStep) {
      setDesktopPosition(null);
      setElementNotFound(false);
      return;
    }

    const calcular = () => {
      const element = step.targetSelector ? document.querySelector(step.targetSelector) : null;
      if (!element) {
        setDesktopPosition(null);
        setElementNotFound(true);
        return;
      }
      setElementNotFound(false);

      const rect = element.getBoundingClientRect();
      const pad = step.spotlightPadding || 8;
      const gap = 16;
      const W = TOOLTIP_WIDTH;
      const H = tooltipRef.current?.offsetHeight || 340;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let top: number;
      let left: number;

      const derecha = rect.right + pad + gap;
      const izquierda = rect.left - pad - gap - W;
      if (step.placement === 'right' && derecha + W < vw - 16) {
        left = derecha;
        top = rect.top + Math.min(rect.height, 260) / 2 - H / 2;
      } else if ((step.placement === 'left' || step.placement === 'right') && izquierda > 16) {
        left = izquierda;
        top = rect.top + Math.min(rect.height, 260) / 2 - H / 2;
      } else {
        left = rect.left + rect.width / 2 - W / 2;
        top = rect.bottom + pad + gap;
        if (top + H > vh - 16) top = rect.top - pad - gap - H;
        if (top < 16) top = (vh - H) / 2;
      }

      setDesktopPosition({
        top: Math.min(Math.max(top, 88), vh - H - 16),
        left: Math.min(Math.max(left, 16), vw - W - 16),
      });
    };

    // Tras el desplazamiento suave del foco y otra vez cuando el tooltip ya tiene su altura real
    const t1 = setTimeout(calcular, 120);
    const t2 = setTimeout(calcular, 650);
    window.addEventListener('resize', calcular);
    window.addEventListener('scroll', calcular, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', calcular);
      window.removeEventListener('scroll', calcular, true);
    };
  }, [isActive, isMobile, isCenteredStep, step]);

  // En móvil, si el elemento no existe (p. ej. aún no hay resultados) se usa la tarjeta centrada
  useEffect(() => {
    if (!isActive || !isMobile || isCenteredStep) {
      setMobileElementNotFound(false);
      return;
    }
    const selector = step.targetSelectorMobile || step.targetSelector;
    const timer = setTimeout(() => setMobileElementNotFound(!selector || !document.querySelector(selector)), 150);
    return () => clearTimeout(timer);
  }, [isActive, isMobile, isCenteredStep, step, currentStepIndex]);

  // Teclado: Esc cierra, flechas/Enter navegan
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') onNext();
      else if (e.key === 'ArrowLeft' && currentStepIndex > 0) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onSkip, onNext, onPrev, currentStepIndex]);

  if (!isActive) return null;

  const Icon = step.icon ? iconMap[step.icon] : null;
  const useMobileLayout = isMobile && !isCenteredStep && !mobileElementNotFound;
  const useCenteredLayout = !isWelcome && !isFinalStep && (isCenteredStep || (!isMobile && elementNotFound) || (isMobile && mobileElementNotFound));
  const cuerpo = (compacto?: boolean) => (
    <CuerpoPaso
      step={step} Icon={Icon} actual={currentStepIndex} total={totalSteps}
      onNext={onNext} onPrev={onPrev} onSkip={onSkip} compacto={compacto}
    />
  );

  return (
    <AnimatePresence mode="wait">
      {/* ── BIENVENIDA ── */}
      {isWelcome && (
        <motion.div
          key={`welcome-${step.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed z-[201] inset-0 flex items-center justify-center p-4 pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative w-full max-w-[400px] overflow-y-auto rounded-3xl bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.55)]"
            style={{ maxHeight: viewportHeight ? viewportHeight - 32 : undefined }}
          >
            <HeroMarca>
              <button
                onClick={onSkip}
                className="absolute -top-3 -right-2 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar el tour"
              >
                <X className="w-4 h-4" />
              </button>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-white/10 ring-1 ring-white/25 backdrop-blur-md flex items-center justify-center shadow-xl"
              >
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, 0] }}
                  transition={{ duration: 1.4, delay: 0.6, ease: 'easeInOut' }}
                  className="inline-flex"
                >
                  <Hand className="w-8 h-8 text-white" />
                </motion.span>
              </motion.div>
              <span className="mt-4 inline-block px-2.5 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-[11px] font-bold tracking-wider uppercase text-blue-100">
                Bienvenido a EduFinder CyL
              </span>
              <h2 className="mt-3 !text-[1.6rem] !font-extrabold !leading-tight !text-white tracking-tight">{step.title}</h2>
            </HeroMarca>

            <div className="px-6 pt-5 pb-6">
              <p className="!text-sm !text-neutral-600 !leading-relaxed text-center">{step.description}</p>

              <ul className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: Building2, label: 'Todos los centros', tone: 'text-emerald-600 bg-emerald-50' },
                  { icon: GraduationCap, label: 'Ciclos de FP', tone: 'text-blue-600 bg-blue-50' },
                  { icon: Database, label: 'Datos oficiales', tone: 'text-orange-600 bg-orange-50' },
                ].map((f, i) => (
                  <motion.li
                    key={f.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-neutral-50 text-center"
                  >
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${f.tone}`}>
                      <f.icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="text-[11px] font-bold text-[#223945] leading-tight px-1">{f.label}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                onClick={onNext}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-[15px] font-bold shadow-lg shadow-[#223945]/30"
              >
                Empezar el tour
                <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[11px] font-bold">1 min</span>
              </motion.button>
              <button
                onClick={onSkip}
                className="mt-2 w-full py-2.5 text-sm font-semibold text-neutral-500 hover:text-[#223945] transition-colors"
              >
                Prefiero explorar por mi cuenta
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── MÓVIL: hoja inferior sobre la barra de navegación ── */}
      {useMobileLayout && (
        <motion.div
          key={`mobile-${step.id}`}
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 35 } }}
          exit={{ opacity: 0, y: 40, transition: { duration: 0.18 } }}
          data-tour-sheet
          className="fixed z-[201] inset-x-0 px-3 pb-3 pointer-events-auto"
          style={{ bottom: 'var(--bottom-nav-height)' }}
        >
          <div
            className="relative bg-white rounded-3xl shadow-[0_-10px_50px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5 max-w-lg mx-auto overflow-y-auto"
            style={{ maxHeight: 'calc(100dvh - var(--bottom-nav-height) - var(--mobile-header-height) - 1.5rem)' }}
          >
            {cuerpo(true)}
          </div>
        </motion.div>
      )}

      {/* ── CENTRADO: pasos sin elemento visible ── */}
      {useCenteredLayout && (
        <motion.div
          key={`centered-${step.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
          className="fixed z-[201] inset-0 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div
            className="relative w-full bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-y-auto"
            style={{ maxWidth: TOOLTIP_WIDTH, maxHeight: viewportHeight ? viewportHeight - 32 : undefined }}
          >
            {cuerpo()}
          </div>
        </motion.div>
      )}

      {/* ── ESCRITORIO: junto al elemento ── */}
      {!isWelcome && !isFinalStep && !useMobileLayout && !useCenteredLayout && (
        <motion.div
          key={`desktop-${step.id}`}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: desktopPosition ? 1 : 0, scale: desktopPosition ? 1 : 0.96, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
          className="fixed z-[201] pointer-events-auto"
          style={{ top: desktopPosition?.top ?? 0, left: desktopPosition?.left ?? 0, width: TOOLTIP_WIDTH }}
        >
          <div className="relative bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/5">
            {cuerpo()}
          </div>
        </motion.div>
      )}

      {/* ── FINAL ── */}
      {isFinalStep && (
        <motion.div
          key={`final-${step.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed z-[201] inset-0 flex items-center justify-center p-4 pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative w-full max-w-[400px] overflow-y-auto rounded-3xl bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.55)]"
            style={{ maxHeight: viewportHeight ? viewportHeight - 32 : undefined }}
          >
            <HeroMarca>
              {/* Destellos con los colores de los tipos de centro */}
              {['bg-blue-400', 'bg-orange-400', 'bg-emerald-400', 'bg-yellow-300', 'bg-pink-400', 'bg-rose-400'].map((c, i) => (
                <motion.span
                  key={c}
                  aria-hidden="true"
                  className={`absolute w-2 h-2 rounded-full ${c}`}
                  style={{ left: `${12 + i * 15}%`, top: `${20 + (i % 3) * 22}%` }}
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
                />
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-white/10 ring-1 ring-white/25 backdrop-blur-md flex items-center justify-center shadow-xl"
              >
                <PartyPopper className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="mt-4 !text-[1.75rem] !font-extrabold !text-white tracking-tight">{step.title}</h2>
              <p className="mt-1 !text-sm !text-blue-100/90">Ya sabes moverte por EduFinder</p>
            </HeroMarca>

            <div className="px-6 pt-5 pb-6">
              <ul className="space-y-2">
                {[
                  { icon: Compass, text: 'Descubre qué FP encaja contigo' },
                  { icon: Search, text: 'Filtra y lee cada centro de un vistazo' },
                  { icon: Scale, text: 'Guarda tus favoritos y compáralos' },
                ].map((f, i) => (
                  <motion.li
                    key={f.text}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-50"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-[#223945]">{f.text}</span>
                    <f.icon className="w-4 h-4 text-neutral-400" />
                  </motion.li>
                ))}
              </ul>

              {!user && <p className="mt-4 !text-sm !text-neutral-500 text-center !leading-relaxed">{step.description}</p>}

              <div className="mt-5 space-y-2">
                {!user ? (
                  <>
                    <Link
                      href="/registro"
                      onClick={onNext}
                      className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 !text-white text-[15px] font-bold shadow-lg shadow-[#223945]/30"
                    >
                      <UserPlus className="w-5 h-5" />
                      Crear cuenta gratis
                    </Link>
                    <button
                      onClick={onNext}
                      className="w-full py-2.5 text-sm font-semibold text-neutral-500 hover:text-[#223945] transition-colors"
                    >
                      Ahora no, quiero explorar
                    </button>
                  </>
                ) : (
                  <motion.button
                    onClick={onNext}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-[15px] font-bold shadow-lg shadow-[#223945]/30"
                  >
                    Empezar a explorar
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
