'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Briefcase,
  TrendingUp,
  MapPin,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { QUESTIONS } from '@/lib/descubre-fp/data';
import { runQuiz, getTotalQuestions } from '@/lib/descubre-fp/engine';
import {
  QuizResult,
  FamilyMatch,
} from '@/lib/descubre-fp/types';
import { saveFpQuizResult, getFpQuizResult } from '@/services/api';

const STORAGE_KEY = 'edufinder_descubre_fp_result';

type Screen = 'intro' | 'question' | 'processing' | 'results';

const PROCESSING_MESSAGES = [
  'Estamos leyendo tus respuestas...',
  'Buscando qué te hace único...',
  'Comparando con 14 caminos diferentes...',
  'Encontrando dónde brillarías más...',
  'Casi lo tenemos...',
];

// ─── Intro ───────────────────────────────────────────────────────────────────

function IntroScreen({ onStart, userName }: { onStart: () => void; userName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-center px-6 pt-12 pb-12 max-w-md mx-auto"
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 flex items-center justify-center shadow-xl shadow-blue-900/20 mb-8">
        <Compass className="w-8 h-8 text-white" />
      </div>

      {userName && (
        <p className="text-base font-semibold text-neutral-400 mb-1 tracking-wide">
          Hola, {userName}
        </p>
      )}
      <h1 className="text-xl md:text-3xl font-bold text-[#223945] mb-3 leading-snug">
        Vamos a descubrir tu FP
      </h1>

      <div className="space-y-5 mb-10 max-w-sm text-left">
        <p className="text-neutral-600 text-base leading-relaxed">
          No siempre es fácil saber qué estudiar. Por eso te vamos a hacer{' '}
          <strong className="text-[#223945] font-semibold">12 preguntas cortas</strong>{' '}
          sobre tus intereses y tu forma de ser.
        </p>
        <p className="text-neutral-600 text-base leading-relaxed">
          Con tus respuestas analizaremos qué{' '}
          <strong className="text-[#223945] font-semibold">familias profesionales</strong>{' '}
          encajan mejor contigo — y te explicaremos por qué cada una puede ser tu camino.
        </p>
        <p className="text-neutral-500 text-sm leading-relaxed">
          No tardarás nada, apenas{' '}
          <strong className="text-neutral-500 font-semibold">3 minutos</strong>.
          Sin registro ni coste.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#223945] to-blue-600 text-white font-bold text-base px-10 py-4 rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 transition-all w-full sm:w-auto"
      >
        Empezar
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}

// ─── Question ────────────────────────────────────────────────────────────────

interface QuestionScreenProps {
  questionIndex: number;
  answers: Record<number, string>;
  onAnswer: (optionId: string) => void;
  onBack: () => void;
}

function QuestionScreen({ questionIndex, answers, onAnswer, onBack }: QuestionScreenProps) {
  const question = QUESTIONS[questionIndex];
  const total = getTotalQuestions();
  const progress = ((questionIndex) / total) * 100;
  const selected = answers[question.id];

  const handleSelect = (optionId: string) => {
    onAnswer(optionId);
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col px-5 pt-4 pb-8 max-w-lg mx-auto min-h-[70vh]"
    >
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-2">
          <span className="text-[#223945]/60 font-bold uppercase tracking-wide text-[11px]">
            {question.category}
          </span>
          <span className="tabular-nums">
            {questionIndex + 1} / {total}
          </span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#223945] to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#223945] mb-6 leading-snug">
        {question.text}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, i) => {
          const isSelected = selected === option.id;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                ${isSelected
                  ? 'border-[#223945] bg-gradient-to-r from-[#223945] to-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'}
              `}
            >
              <span className="text-2xl shrink-0">{option.emoji}</span>
              <span className="font-medium text-sm sm:text-base leading-snug">
                {option.text}
              </span>
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 shrink-0 ml-auto opacity-80" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Back — acción secundaria, debajo de las opciones */}
      {questionIndex > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="mt-4 flex items-center gap-1.5 text-neutral-400 hover:text-neutral-600 transition-colors text-sm font-medium mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Pregunta anterior
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Processing ──────────────────────────────────────────────────────────────

function ProcessingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center px-6 min-h-[70vh] text-center"
    >
      {/* Orb con anillos */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Anillo exterior — dashed lento */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute w-44 h-44 rounded-full border border-blue-300/25"
          style={{ borderStyle: 'dashed' }}
        />
        {/* Anillo medio — sólido, giro contrario */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-36 h-36 rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#223945',
            borderRightColor: 'transparent',
            borderBottomColor: 'rgb(96 165 250 / 0.6)',
            borderLeftColor: 'transparent',
          }}
        />
        {/* Anillo interior — giro rápido */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute w-28 h-28 rounded-full"
          style={{
            border: '1.5px solid transparent',
            borderTopColor: 'transparent',
            borderRightColor: 'rgb(147 197 253 / 0.5)',
            borderBottomColor: 'transparent',
            borderLeftColor: '#223945',
          }}
        />
        {/* Orb central — respira */}
        <motion.div
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#223945] to-blue-500 flex items-center justify-center"
          style={{ boxShadow: '0 0 48px rgba(59,130,246,0.35), 0 0 16px rgba(34,57,69,0.25)' }}
        >
          <Compass className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      {/* Titular */}
      <h2 className="text-xl font-bold text-[#223945] mb-2">
        Buscando tu camino ideal
      </h2>
      <p className="text-neutral-500 text-sm max-w-xs leading-relaxed mb-8">
        Estamos analizando tus respuestas para encontrar las familias profesionales que mejor encajan contigo.
      </p>

      {/* Mensaje cíclico — chip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2.5 bg-white border border-neutral-200 shadow-sm rounded-full px-4 py-2.5"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-blue-500 shrink-0"
          />
          <span className="text-sm font-medium text-neutral-600">
            {PROCESSING_MESSAGES[msgIdx]}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ResultsScreenProps {
  result: QuizResult;
  onRestart: () => void;
  userName?: string;
  saveStatus?: SaveStatus;
  isAuthenticated?: boolean;
}


const RANK_CONFIG = [
  { label: 'Mejor opción', labelColor: '#FCD34D', ghostColor: 'rgba(252,211,77,0.13)', cardBorder: 'border-2 border-amber-400/60 shadow-xl shadow-amber-400/10' },
  { label: '2ª opción',    labelColor: 'rgba(255,255,255,0.55)', ghostColor: 'rgba(255,255,255,0.06)', cardBorder: 'border border-neutral-200 shadow-md' },
  { label: '3ª opción',    labelColor: 'rgba(255,255,255,0.45)', ghostColor: 'rgba(255,255,255,0.04)', cardBorder: 'border border-neutral-200 shadow-md' },
];

function FamilyCard({ match, rank }: { match: FamilyMatch; rank: number }) {
  const { family, score, matchedTraits, justification } = match;
  const cfg = RANK_CONFIG[rank - 1] ?? RANK_CONFIG[2];
  const searchUrl = `/?tipo=FP&familia=${encodeURIComponent(family.queryParam)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`rounded-2xl overflow-hidden flex flex-col h-full ${cfg.cardBorder}`}
    >
      {/* Header */}
      <div
        className="relative p-4 shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${family.colorFrom}, ${family.colorTo})` }}
      >
        {/* Número fantasma de fondo */}
        <span
          className="absolute -right-3 -top-5 text-[110px] font-black leading-none select-none pointer-events-none"
          style={{ color: cfg.ghostColor }}
        >
          {rank}
        </span>

        {/* Etiqueta de posición */}
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 relative z-10" style={{ color: cfg.labelColor }}>
          {cfg.label}
        </p>

        {/* Nombre + tagline */}
        <h3 className="font-extrabold text-base leading-tight mb-0.5 relative z-10" style={{ color: '#ffffff' }}>
          {family.nombre}
        </h3>
        <p className="text-xs font-medium relative z-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {family.tagline}
        </p>

        {/* Compatibilidad prominente + barra */}
        <div className="mt-4 relative z-10">
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-2xl font-black leading-none" style={{ color: '#ffffff' }}>{score}%</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>compatible</span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.4 + rank * 0.1, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Body — siempre visible */}
      <div className="p-4 bg-white flex flex-col flex-1 gap-4">

        {/* Por qué encaja — borde izquierdo de acento */}
        <div className="pl-3 border-l-2 border-[#223945]/25">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Por qué encaja contigo</p>
          <p className="text-neutral-600 text-xs leading-relaxed">{justification}</p>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Qué aprenderás */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-3 h-3 text-blue-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Qué aprenderás</p>
          </div>
          <ul className="space-y-1.5 pl-1">
            {family.queAprenderas.map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-neutral-600 leading-snug">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0 block" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* En qué trabajarías */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-green-50 flex items-center justify-center shrink-0">
              <Briefcase className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">En qué trabajarías</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {family.salidasProfesionales.map(s => (
              <span key={s} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-100">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Ciclos en CyL */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3 h-3 text-purple-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Ciclos en CyL</p>
          </div>
          <ul className="space-y-2.5 pl-1">
            {family.ciclosDestacados.map(c => {
              const [nombre, nivel] = c.split(' — ');
              const isSuper = nivel?.includes('Superior');
              const isMedio = nivel?.includes('Medio');
              return (
                <li key={c} className="flex items-start gap-2">
                  <span style={{ color: '#a855f7' }} className="mt-0.5 shrink-0 font-bold leading-none">→</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-neutral-700 leading-snug">{nombre}</span>
                    {nivel && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full self-start bg-neutral-100 text-neutral-500">
                        {nivel}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <Link
            href={searchUrl}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#223945] to-blue-600 text-white font-bold text-xs py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          >
            <MapPin className="w-3.5 h-3.5" />
            Ver centros que imparten esta familia
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ResultsScreen({ result, onRestart, userName, saveStatus = 'idle', isAuthenticated = false }: ResultsScreenProps) {
  const { userProfile, matches } = result;
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCarouselScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.scrollWidth / matches.length));
    setActiveIdx(Math.max(0, Math.min(idx, matches.length - 1)));
  }, [matches.length]);

  // "Perfil tecnológico y digital" → "Tecnológico y digital" (solo primera letra en caps)
  const displayLabel = userProfile.profileLabel
    .replace(/^Perfil\s+/i, '')
    .replace(/^./, c => c.toUpperCase());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ── Sección estrecha: header + perfil + traits ── */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-2">
        {/* Header */}
        <div className="pb-5 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4 mx-auto"
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>
          <p className="text-sm text-neutral-400 font-medium mb-2">
            {userName ? `${userName}, tenemos tu análisis — tienes un perfil` : 'Tu análisis está listo — tienes un perfil'}
          </p>
          <h2 className="text-2xl font-extrabold text-[#223945]">
            {displayLabel}
          </h2>

          {/* Save status badge */}
          <AnimatePresence>
            {saveStatus === 'saving' && (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold"
              >
                <span className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-500 rounded-full animate-spin" />
                Guardando en tu perfil...
              </motion.div>
            )}
            {saveStatus === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-semibold"
              >
                <CheckCircle2 className="w-3 h-3" />
                Guardado en tu perfil
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Descripción del perfil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#223945] to-blue-700 rounded-2xl p-5 mb-5 shadow-xl shadow-blue-900/20"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Hemos detectado en ti
          </p>
          <ul className="space-y-2.5 mb-4">
            {(userProfile.profileSentences.length > 0
              ? userProfile.profileSentences
              : ['tienes un perfil muy versátil']
            ).map((sentence, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-blue-300 shrink-0 text-sm">→</span>
                <span className="text-white text-sm leading-relaxed">
                  {sentence.charAt(0).toUpperCase() + sentence.slice(1)}
                </span>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Trabajarías mejor en{' '}
              <span className="text-white font-semibold">{userProfile.workEnvironment}</span>.
            </p>
          </div>
        </motion.div>

      </div>

      {/* ── Separator ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
            Nuestras recomendaciones para ti
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
      </div>

      {/* ── Family cards — scroll snap en móvil, grid en desktop ── */}
      <div className="mb-8">
        {/* Mobile: horizontal snap scroll centrado */}
        <div
          ref={scrollRef}
          onScroll={handleCarouselScroll}
          className="md:hidden flex gap-4 overflow-x-auto pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {/* Spacer inicial para centrar primera card */}
          <div className="shrink-0" style={{ width: 'calc(9vw - 16px)', minWidth: 4 }} />
          {matches.map((match, i) => (
            <div
              key={match.family.codigo}
              className="shrink-0"
              style={{ scrollSnapAlign: 'center', width: '82vw' }}
            >
              <FamilyCard match={match} rank={i + 1} />
            </div>
          ))}
          {/* Spacer final simétrico */}
          <div className="shrink-0" style={{ width: 'calc(9vw - 16px)', minWidth: 4 }} />
        </div>

        {/* Dots indicador — estilo iOS pill */}
        <div className="flex justify-center items-center gap-1.5 mt-3 md:hidden">
          {matches.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === activeIdx ? 20 : 6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`h-1.5 rounded-full ${i === activeIdx ? 'bg-[#223945]' : 'bg-neutral-300'}`}
            />
          ))}
        </div>

        {/* Desktop: 3 columnas al ancho estándar del sitio */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-start">
          {matches.map((match, i) => (
            <FamilyCard key={match.family.codigo} match={match} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pb-8">
        {/* Cards — mismo ancho que el grid de familias en desktop */}
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 mb-6 ${!isAuthenticated ? 'max-w-7xl' : 'max-w-lg'}`}>
          <div className={!isAuthenticated ? 'md:grid md:grid-cols-2 md:gap-6 md:items-stretch' : ''}>

            <div className={`bg-neutral-50 rounded-2xl p-5 border border-neutral-100 flex flex-col justify-center ${!isAuthenticated ? 'mb-5 md:mb-0' : ''}`}>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Esperamos que esto te haya dado un poco más de claridad sobre tus opciones.{' '}
                <span className="font-medium text-neutral-700">Estas recomendaciones son un punto de partida</span>{' '}
                — lo siguiente es explorar, preguntar y descubrir el camino que más te encaje.
              </p>
            </div>

            {/* CTA registro para usuarios sin cuenta */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#223945] to-blue-700 rounded-2xl p-5 text-left shadow-lg shadow-blue-900/15 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    ¿Quieres guardarlo?
                  </p>
                  <p className="text-sm font-semibold mb-4 leading-snug" style={{ color: '#ffffff' }}>
                    Crea una cuenta gratuita y consulta tu análisis cuando quieras, desde cualquier dispositivo.
                  </p>
                </div>
                <Link
                  href="/registro"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#223945] text-sm font-bold rounded-xl hover:bg-neutral-50 active:scale-95 transition-all shadow-md self-start"
                >
                  Crear cuenta gratis
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Repetir — siempre centrado */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#223945] border border-[#223945]/20 hover:bg-[#223945]/5 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Repetir el análisis
          </button>
        </div>
      </div>

      {/* Clearance spacer for fixed bottom nav on mobile/PWA — nav is h-16 + safe-area-inset-bottom */}
      <div
        aria-hidden="true"
        className="md:hidden"
        style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 4.5rem)' }}
      />
    </motion.div>
  );
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

export default function DescubreFPClient() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [initialLoading, setInitialLoading] = useState(false);

  // Restore saved result: localStorage (instant) → API fallback para usuarios con cuenta
  useEffect(() => {
    const localResult = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as QuizResult;
        return parsed?.matches && parsed?.userProfile ? parsed : null;
      } catch { return null; }
    })();

    if (localResult) {
      // Mostramos resultados al instante desde localStorage
      setResult(localResult);
      setScreen('results');
      // Si tiene cuenta, sincronizamos silenciosamente a la API
      // Esto migra resultados anteriores y garantiza que el perfil esté actualizado
      if (user) {
        saveFpQuizResult(localResult)
          .then(() => setSaveStatus('saved'))
          .catch(() => {}); // fallo silencioso — el resultado ya se muestra
      }
      return;
    }

    // Sin localStorage: si tiene cuenta intentamos cargar desde la API
    if (user) {
      setInitialLoading(true);
      getFpQuizResult()
        .then(apiResult => {
          if (apiResult?.matches && apiResult?.userProfile) {
            setResult(apiResult);
            setScreen('results');
            setSaveStatus('saved');
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apiResult)); } catch {}
          }
        })
        .catch(() => {})
        .finally(() => setInitialLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(() => {
    setScreen('question');
    setQuestionIndex(0);
  }, []);

  const handleAnswer = useCallback(
    (optionId: string) => {
      const question = QUESTIONS[questionIndex];
      const newAnswers = { ...answers, [question.id]: optionId };
      setAnswers(newAnswers);

      // Auto-advance after brief highlight
      setTimeout(() => {
        if (questionIndex < QUESTIONS.length - 1) {
          setQuestionIndex(i => i + 1);
        } else {
          // All answered — calculate
          setScreen('processing');
          setTimeout(() => {
            const quizResult = runQuiz(newAnswers);
            setResult(quizResult);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(quizResult)); } catch {}
            setScreen('results');

            // Auto-save to API for authenticated users
            if (user) {
              setSaveStatus('saving');
              saveFpQuizResult(quizResult)
                .then(() => setSaveStatus('saved'))
                .catch(() => setSaveStatus('error'));
            }
          }, 4000);
        }
      }, 350);
    },
    [questionIndex, answers]
  );

  const handleBack = useCallback(() => {
    if (questionIndex > 0) {
      setQuestionIndex(i => i - 1);
    } else {
      setScreen('intro');
    }
  }, [questionIndex]);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setResult(null);
    setQuestionIndex(0);
    setScreen('intro');
    setSaveStatus('idle');
    window.scrollTo({ top: 0, behavior: 'instant' });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const userName = user?.name?.split(' ')[0] ?? undefined;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#dbeafe] via-white to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 flex items-center justify-center shadow-xl shadow-blue-900/20">
            <Compass className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-sm font-medium text-neutral-500">Cargando tu análisis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#dbeafe] via-white to-white">
      <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <IntroScreen key="intro" onStart={handleStart} userName={userName} />
          )}
          {screen === 'question' && (
            <QuestionScreen
              key={`q-${questionIndex}`}
              questionIndex={questionIndex}
              answers={answers}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}
          {screen === 'processing' && (
            <ProcessingScreen key="processing" />
          )}
          {screen === 'results' && result && (
            <ResultsScreen
              key="results"
              result={result}
              onRestart={handleRestart}
              userName={userName}
              saveStatus={saveStatus}
              isAuthenticated={!!user}
            />
          )}
      </AnimatePresence>
    </div>
  );
}
