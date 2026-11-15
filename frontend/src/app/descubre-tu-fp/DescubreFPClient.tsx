'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Briefcase,
  GraduationCap,
  MapPin,
  Compass,
  ListChecks,
  Clock,
  UserX,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { QUESTIONS } from '@/lib/descubre-fp/data';
import { runQuiz, getTotalQuestions } from '@/lib/descubre-fp/engine';
import {
  QuizResult,
  FamilyMatch,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_EMOJIS,
} from '@/lib/descubre-fp/types';
import { saveFpQuizResult, getFpQuizResult } from '@/services/api';
import { BrandBackdrop } from '@/components/auth/AuthLayout';
import { nivelFP } from '@/lib/centro-format';

const STORAGE_KEY = 'edufinder_descubre_fp_result';

type Screen = 'intro' | 'question' | 'processing' | 'results';

const PROCESSING_MESSAGES = [
  'Estamos leyendo tus respuestas...',
  'Buscando qué te hace único...',
  'Comparando con 14 caminos diferentes...',
  'Encontrando dónde brillarías más...',
  'Casi lo tenemos...',
];

// Icono de marca flotante (mismo lenguaje que las pantallas de acceso)
function BrandIcon({ icon: Icon, pulse = true }: { icon: typeof Compass; pulse?: boolean }) {
  return (
    <div className="relative w-fit mx-auto">
      {pulse && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.2, 0.45] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-blue-400 blur-xl"
        />
      )}
      <div className="relative w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-br from-[#223945] via-[#2d4a5e] to-blue-600 ring-[6px] ring-white shadow-xl shadow-[#223945]/30 flex items-center justify-center">
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  );
}

// ─── Intro ───────────────────────────────────────────────────────────────────

function IntroScreen({ onStart, userName }: { onStart: () => void; userName?: string }) {
  const features = [
    { icon: ListChecks, label: '12 preguntas' },
    { icon: Clock, label: '3 minutos' },
    { icon: UserX, label: 'Sin registro' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl border border-white/70 shadow-[0_24px_60px_-20px_rgba(34,57,69,0.35)] px-6 sm:px-8 pt-14 pb-8 text-center">
        <div aria-hidden="true" className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />
        </div>
        <div className="absolute -top-9 left-1/2 -translate-x-1/2">
          <BrandIcon icon={Compass} />
        </div>

        {userName && <p className="text-sm font-semibold text-blue-600 mb-1">Hola, {userName}</p>}
        <h1 className="text-[1.75rem] sm:text-3xl font-extrabold tracking-tight text-[#223945] leading-tight">
          Descubre tu FP
        </h1>
        <p className="mt-3 text-[15px] text-neutral-600 leading-relaxed">
          Responde a unas preguntas sobre lo que te gusta y cómo eres, y te diremos qué{' '}
          <strong className="text-[#223945] font-semibold">familias profesionales</strong> encajan contigo y por qué.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {features.map(f => (
            <div key={f.label} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#223945]/[0.04] border border-[#223945]/[0.06]">
              <f.icon className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-[#223945]">{f.label}</span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="mt-7 w-full h-13 py-3.5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white font-bold text-base shadow-lg shadow-[#223945]/25 hover:shadow-xl transition-shadow"
        >
          Empezar
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        <p className="mt-3 text-xs text-neutral-400">No hay respuestas buenas ni malas: elige lo que más se parezca a ti.</p>
      </div>
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
  const selected = answers[question.id];

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl border border-white/70 shadow-[0_24px_60px_-20px_rgba(34,57,69,0.3)] p-5 sm:p-7">
        {/* Progreso: un segmento por pregunta */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            aria-label={questionIndex > 0 ? 'Pregunta anterior' : 'Volver al inicio'}
            className="-ml-1.5 p-1.5 rounded-full text-neutral-400 hover:text-[#223945] hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[11px] font-bold uppercase tracking-wider text-blue-700">
            {question.category}
          </span>
          <span className="text-sm font-bold tabular-nums text-[#223945]">
            {questionIndex + 1}<span className="text-neutral-400 font-medium">/{total}</span>
          </span>
        </div>
        <div className="flex gap-1 mb-6" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-neutral-100 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#223945] to-blue-500"
                initial={false}
                animate={{ width: i < questionIndex ? '100%' : i === questionIndex ? '50%' : '0%' }}
                transition={{ duration: 0.35 }}
              />
            </div>
          ))}
        </div>

        <h2 className="text-[1.35rem] sm:text-2xl font-extrabold tracking-tight text-[#223945] leading-snug mb-5">
          {question.text}
        </h2>

        <div className="flex flex-col gap-2.5">
          {question.options.map((option, i) => {
            const isSelected = selected === option.id;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAnswer(option.id)}
                className={`w-full flex items-center gap-3.5 p-3 pr-4 rounded-2xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-transparent bg-gradient-to-r from-[#223945] to-blue-600 text-white shadow-lg shadow-[#223945]/25'
                    : 'border-neutral-200 bg-white hover:border-[#223945]/30 hover:shadow-md text-neutral-800'
                }`}
              >
                <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-2xl ${isSelected ? 'bg-white/15' : 'bg-neutral-50'}`}>
                  {option.emoji}
                </span>
                <span className="flex-1 font-semibold text-[15px] leading-snug">{option.text}</span>
                {isSelected && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </div>
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
      className="flex flex-col items-center justify-center text-center"
    >
      {/* Orb con anillos */}
      <div className="relative flex items-center justify-center mb-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute w-44 h-44 rounded-full border border-blue-300/40"
          style={{ borderStyle: 'dashed' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-36 h-36 rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#223945',
            borderBottomColor: 'rgb(96 165 250 / 0.6)',
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute w-28 h-28 rounded-full"
          style={{
            border: '1.5px solid transparent',
            borderRightColor: 'rgb(147 197 253 / 0.5)',
            borderLeftColor: '#223945',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#223945] to-blue-500 ring-[6px] ring-white flex items-center justify-center"
          style={{ boxShadow: '0 0 48px rgba(59,130,246,0.35), 0 0 16px rgba(34,57,69,0.25)' }}
        >
          <Compass className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight text-[#223945] mb-2">Buscando tu camino ideal</h2>
      <p className="text-neutral-500 text-[15px] max-w-xs leading-relaxed mb-8">
        Estamos analizando tus respuestas para encontrar las familias profesionales que mejor encajan contigo.
      </p>

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
          <span className="text-sm font-medium text-neutral-600">{PROCESSING_MESSAGES[msgIdx]}</span>
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

const RANK_LABELS = ['Mejor opción', '2ª opción', '3ª opción'];

// Encabezado de sección dentro de la tarjeta de familia
function SectionTitle({ icon: Icon, tone, children }: { icon: typeof BookOpen; tone: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#223945]/70">{children}</p>
    </div>
  );
}

function FamilyCard({ match, rank }: { match: FamilyMatch; rank: number }) {
  const { family, score, justification } = match;
  const best = rank === 1;
  const searchUrl = `/?tipo=FP&familia=${encodeURIComponent(family.queryParam)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + rank * 0.1 }}
      className={`relative rounded-3xl overflow-hidden flex flex-col h-full bg-white shadow-[0_20px_50px_-20px_rgba(34,57,69,0.35)] ${
        best ? 'ring-2 ring-amber-400' : 'ring-1 ring-neutral-200/80'
      }`}
    >
      {/* Cabecera con el color de la familia */}
      <div
        className="relative p-5 shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${family.colorFrom}, ${family.colorTo})` }}
      >
        <span aria-hidden="true" className="absolute -right-4 -bottom-8 text-[140px] leading-none select-none pointer-events-none opacity-15">
          {family.emoji}
        </span>

        <span className={`relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
          best ? 'bg-amber-300 text-amber-950' : 'bg-white/20 text-white'
        }`}>
          {best && <Sparkles className="w-3 h-3" />}
          {RANK_LABELS[rank - 1] ?? `${rank}ª opción`}
        </span>

        <h3 className="relative mt-3 text-xl font-extrabold leading-tight text-white">{family.nombre}</h3>
        <p className="relative mt-1 text-sm font-medium text-white/80">{family.tagline}</p>

        <div className="relative mt-4">
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-3xl font-black leading-none text-white tabular-nums">{score}%</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">de afinidad</span>
          </div>
          <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.5 + rank * 0.1, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-5">
        {/* Por qué encaja */}
        <div className="rounded-2xl bg-[#223945]/[0.04] border border-[#223945]/[0.06] p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">Por qué encaja contigo</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{justification}</p>
        </div>

        <div>
          <SectionTitle icon={BookOpen} tone="bg-blue-50 text-blue-600">Qué aprenderás</SectionTitle>
          <ul className="space-y-1.5">
            {family.queAprenderas.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-neutral-700 leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-[7px] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionTitle icon={Briefcase} tone="bg-emerald-50 text-emerald-600">En qué trabajarías</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {family.salidasProfesionales.map(s => (
              <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle icon={GraduationCap} tone="bg-purple-50 text-purple-600">Ciclos en Castilla y León</SectionTitle>
          <ul className="space-y-1.5">
            {family.ciclosDestacados.map(c => {
              const [nombre, nivelTexto] = c.split(' — ');
              const nivel = nivelFP(nivelTexto);
              return (
                <li
                  key={c}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${nivel?.soft ?? 'bg-neutral-50 border-neutral-100'}`}
                >
                  <span className="flex-1 min-w-0 text-[13px] font-semibold text-neutral-800 leading-snug">{nombre}</span>
                  {nivelTexto && (
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${nivel?.solid ?? 'bg-neutral-600 text-white'}`}>
                      {nivel?.abbr ?? nivelTexto}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-auto pt-1">
          <Link
            href={searchUrl}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white font-bold text-sm shadow-lg shadow-[#223945]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <MapPin className="w-4 h-4 shrink-0" />
            Ver dónde estudiarla
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

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    const card = el?.children[i + 1] as HTMLElement | undefined; // +1 por el espaciador inicial
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  // "Perfil tecnológico y digital" → "Tecnológico y digital" (solo primera letra en caps)
  const displayLabel = userProfile.profileLabel
    .replace(/^Perfil\s+/i, '')
    .replace(/^./, c => c.toUpperCase());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      {/* ── Tu perfil ── */}
      <div className="max-w-xl mx-auto px-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
          <BrandIcon icon={Sparkles} />
        </motion.div>
        <p className="mt-5 text-sm font-semibold text-neutral-500">
          {userName ? `${userName}, este es tu perfil` : 'Este es tu perfil'}
        </p>
        <h1 className="mt-1 text-[2rem] sm:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-[#223945] via-blue-600 to-blue-400 bg-clip-text text-transparent pb-1">
          {displayLabel}
        </h1>

        {/* Rasgos principales */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {userProfile.topAttributes.map((attr, i) => (
            <motion.span
              key={attr}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white border border-neutral-200 shadow-sm text-[13px] sm:text-sm font-bold text-[#223945]"
            >
              <span>{ATTRIBUTE_EMOJIS[attr]}</span>
              {ATTRIBUTE_LABELS[attr]}
            </motion.span>
          ))}
        </div>

        <AnimatePresence>
          {saveStatus === 'saving' && (
            <motion.div key="saving" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold">
              <span className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-500 rounded-full animate-spin" />
              Guardando en tu perfil...
            </motion.div>
          )}
          {saveStatus === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Guardado en tu perfil
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lo que hemos detectado */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#223945] via-[#24406a] to-blue-700 p-5 sm:p-6 text-left shadow-[0_24px_60px_-20px_rgba(30,58,138,0.55)]"
        >
          <div aria-hidden="true" className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-400/20 blur-3xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-widest text-blue-200/80 mb-3">Hemos detectado en ti</p>
          <ul className="relative space-y-2.5">
            {(userProfile.profileSentences.length > 0 ? userProfile.profileSentences : ['tienes un perfil muy versátil']).map((sentence, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-300 shrink-0" />
                <span className="text-[15px] text-white leading-relaxed">{sentence.charAt(0).toUpperCase() + sentence.slice(1)}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5">
            <Briefcase className="w-4 h-4 mt-0.5 text-blue-300 shrink-0" />
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Trabajarías mejor en <span className="text-white font-semibold">{userProfile.workEnvironment}</span>.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Recomendaciones ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-5 text-center">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#223945]">Tus 3 caminos en la FP</h2>
        <p className="mt-1 text-sm text-neutral-500">Ordenados por afinidad con tu perfil</p>
      </div>

      {/* Móvil: carrusel con snap; escritorio: 3 columnas */}
      <div className="mb-10">
        <div
          ref={scrollRef}
          onScroll={handleCarouselScroll}
          className="md:hidden flex gap-4 overflow-x-auto pb-6 pt-1"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="shrink-0" style={{ width: 'calc(7vw - 16px)', minWidth: 4 }} />
          {matches.map((match, i) => (
            <div key={match.family.codigo} className="shrink-0" style={{ scrollSnapAlign: 'center', width: '86vw' }}>
              <FamilyCard match={match} rank={i + 1} />
            </div>
          ))}
          <div className="shrink-0" style={{ width: 'calc(7vw - 16px)', minWidth: 4 }} />
        </div>

        {/* Indicador del carrusel: nombre de cada opción, tocable */}
        <div className="md:hidden flex justify-center gap-1.5 px-4">
          {matches.map((m, i) => (
            <button
              key={m.family.codigo}
              onClick={() => scrollToCard(i)}
              className={`max-w-[33%] truncate px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                i === activeIdx ? 'bg-[#223945] text-white shadow-md' : 'bg-white text-neutral-500 border border-neutral-200'
              }`}
            >
              {i + 1}. {m.family.nombre}
            </button>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-stretch">
          {matches.map((match, i) => (
            <FamilyCard key={match.family.codigo} match={match} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* ── Cierre ── */}
      <div className="max-w-3xl mx-auto px-4 pb-10 space-y-4">
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#223945] to-blue-700 p-5 sm:p-6 shadow-lg shadow-blue-900/20 sm:flex sm:items-center sm:justify-between sm:gap-6"
          >
            <div aria-hidden="true" className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200/80 mb-1">¿Quieres guardarlo?</p>
              <p className="text-[15px] font-semibold text-white leading-snug">
                Crea una cuenta gratis y consulta tu análisis cuando quieras, desde cualquier dispositivo.
              </p>
            </div>
            <Link
              href="/registro?redirect=/descubre-tu-fp"
              className="relative mt-4 sm:mt-0 shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#223945] text-sm font-bold rounded-xl hover:bg-neutral-50 active:scale-95 transition-all shadow-md"
            >
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        <div className="rounded-3xl bg-white/70 border border-white/80 p-5 text-center">
          <p className="text-sm text-neutral-600 leading-relaxed">
            <span className="font-semibold text-[#223945]">Esto es un punto de partida.</span> Explora los centros, pregunta en las
            jornadas de puertas abiertas y quédate con el camino que más te ilusione.
          </p>
          <button
            onClick={onRestart}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-[#223945] bg-white border border-neutral-200 hover:border-[#223945]/30 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Repetir el análisis
          </button>
        </div>
      </div>
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
  // Bloquea respuestas mientras se avanza: un doble toque rápido saltaba la pregunta siguiente
  const answeringRef = useRef(false);

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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (answeringRef.current) return;
      answeringRef.current = true;

      const question = QUESTIONS[questionIndex];
      const newAnswers = { ...answers, [question.id]: optionId };
      setAnswers(newAnswers);

      // Auto-advance after brief highlight
      setTimeout(() => {
        answeringRef.current = false;
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
            window.scrollTo({ top: 0, behavior: 'instant' });

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
    [questionIndex, answers, user]
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
  const centered = screen !== 'results';

  return (
    <div
      className={`fp-ui relative isolate bg-brand-gradient min-h-[calc(100dvh-var(--mobile-header-height)-var(--bottom-nav-height))] md:min-h-[calc(100dvh-5rem)] ${
        centered ? 'px-4 flex items-center justify-center py-14' : 'pt-10 md:pt-14'
      }`}
    >
      <BrandBackdrop pattern={false} />
      {initialLoading ? (
        <div className="flex flex-col items-center gap-4">
          <BrandIcon icon={Compass} />
          <p className="text-sm font-medium text-neutral-500">Cargando tu análisis...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {screen === 'intro' && <IntroScreen key="intro" onStart={handleStart} userName={userName} />}
          {screen === 'question' && (
            <QuestionScreen
              key={`q-${questionIndex}`}
              questionIndex={questionIndex}
              answers={answers}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}
          {screen === 'processing' && <ProcessingScreen key="processing" />}
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
      )}
    </div>
  );
}
