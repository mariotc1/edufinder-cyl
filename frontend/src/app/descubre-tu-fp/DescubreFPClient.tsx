'use client';

import { useState, useCallback, useEffect } from 'react';
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
  AttributeKey,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_EMOJIS,
} from '@/lib/descubre-fp/types';

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

interface ResultsScreenProps {
  result: QuizResult;
  onRestart: () => void;
}

function TraitBadge({ attr }: { attr: AttributeKey }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
      <span>{ATTRIBUTE_EMOJIS[attr]}</span>
      {ATTRIBUTE_LABELS[attr]}
    </span>
  );
}

function FamilyCard({ match, rank }: { match: FamilyMatch; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 1);
  const { family, score, matchedTraits, justification } = match;
  const isPrimary = rank === 1;

  const searchUrl = `/?tipo=FP&familia=${encodeURIComponent(family.queryParam)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`rounded-2xl overflow-hidden shadow-card border border-neutral-200 ${isPrimary ? 'ring-2 ring-[#223945]/20' : ''}`}
    >
      {/* Header */}
      <div
        className="relative p-5 cursor-pointer select-none"
        style={{ background: `linear-gradient(135deg, ${family.colorFrom}, ${family.colorTo})` }}
        onClick={() => setExpanded(e => !e)}
      >
        {isPrimary && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-secondary-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              <Sparkles className="w-2.5 h-2.5" />
              Mejor coincidencia
            </span>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            {family.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/60 text-xs font-bold">#{rank}</span>
              <div className="h-3 w-px bg-white/30" />
              <span className="text-white/60 text-xs">{score}% de compatibilidad</span>
            </div>
            <h3 className="text-white font-extrabold text-lg leading-tight mb-1">
              {family.nombre}
            </h3>
            <p className="text-white/80 text-xs font-medium">{family.tagline}</p>
          </div>
          <div className="shrink-0 text-white/60 mt-1">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Match bar */}
        <div className="mt-4">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.4 + rank * 0.1, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-white space-y-5">
              {/* Justification */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-neutral-700 text-sm leading-relaxed">
                  <span className="font-bold text-[#223945]">¿Por qué encaja contigo? </span>
                  {justification}
                </p>
                {matchedTraits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {matchedTraits.map(attr => (
                      <TraitBadge key={attr} attr={attr} />
                    ))}
                  </div>
                )}
              </div>

              {/* Descripcion */}
              <p className="text-neutral-600 text-sm leading-relaxed">{family.descripcion}</p>

              {/* Qué aprenderás */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-[#223945]" />
                  <h4 className="font-bold text-[#223945] text-sm">Qué aprenderás</h4>
                </div>
                <ul className="space-y-1.5">
                  {family.queAprenderas.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-success-500 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Salidas profesionales */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-[#223945]" />
                  <h4 className="font-bold text-[#223945] text-sm">Salidas profesionales</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {family.salidasProfesionales.map(s => (
                    <span
                      key={s}
                      className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ciclos destacados */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#223945]" />
                  <h4 className="font-bold text-[#223945] text-sm">Ciclos destacados en CyL</h4>
                </div>
                <ul className="space-y-1.5">
                  {family.ciclosDestacados.map(c => (
                    <li key={c} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ventajas */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-bold text-[#223945] text-sm mb-2">Ventajas de este camino</h4>
                <ul className="space-y-1">
                  {family.ventajas.map(v => (
                    <li key={v} className="flex items-start gap-2 text-xs text-neutral-600">
                      <span className="text-secondary-500 mt-0.5 shrink-0">★</span>
                      {v}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nivel recomendado */}
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="font-medium text-neutral-700">Nivel recomendado:</span>
                <span className="bg-secondary-100 text-secondary-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {family.nivelRecomendado}
                </span>
              </div>

              {/* CTA */}
              <Link
                href={searchUrl}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#223945] to-blue-600 text-white font-bold text-sm py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
              >
                <MapPin className="w-4 h-4" />
                Ver centros que imparten esta familia
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const { userProfile, matches } = result;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto px-4 pb-12"
    >
      {/* Header perfil */}
      <div className="pt-6 pb-5 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4 mx-auto"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-[#223945] mb-1">Tu perfil</h2>
        <p className="text-secondary-600 font-semibold text-sm">{userProfile.profileLabel}</p>
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

      {/* Top traits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Rasgos dominantes de tu perfil
        </p>
        <div className="flex flex-wrap gap-2">
          {userProfile.topAttributes.map(attr => (
            <TraitBadge key={attr} attr={attr} />
          ))}
        </div>
      </motion.div>

      {/* Separator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
          Nuestras recomendaciones
        </span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Family cards */}
      <div className="space-y-4 mb-8">
        {matches.map((match, i) => (
          <FamilyCard key={match.family.codigo} match={match} rank={i + 1} />
        ))}
      </div>

      {/* Descargo */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-6">
        <p className="text-xs text-neutral-400 leading-relaxed text-center">
          Estas recomendaciones se basan en tus respuestas y en los perfiles de cada familia
          profesional. Son orientativas y complementarias a la orientación de tu centro educativo.
        </p>
      </div>

      {/* Restart */}
      <button
        onClick={onRestart}
        className="flex items-center justify-center gap-2 w-full border-2 border-neutral-200 text-neutral-600 font-semibold text-sm py-3 rounded-xl hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Repetir el test
      </button>
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

  // Restore saved result on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QuizResult;
        if (parsed?.matches && parsed?.userProfile) {
          setResult(parsed);
          setScreen('results');
        }
      }
    } catch {
      // ignore
    }
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
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(quizResult));
            } catch {
              // ignore
            }
            setScreen('results');
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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const userName = user?.name?.split(' ')[0] ?? undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#dbeafe] via-white to-white">
      <div className="max-w-lg mx-auto">
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
            <ResultsScreen key="results" result={result} onRestart={handleRestart} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
