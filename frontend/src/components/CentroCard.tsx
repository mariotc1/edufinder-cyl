import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, GraduationCap, ArrowRight, Heart, Share2, Copy, CheckCircle, Check, Plus, Navigation } from "lucide-react";
import { Centro } from "@/types";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useFavorite } from "@/hooks/useFavorite";
import AddToCompareButton from "./ui/AddToCompareButton";
import { centroName, centroEtapas, centroLugar, nivelFP, denominacionDe } from "@/lib/centro-format";
import { estiloTipo, formatDistancia } from "@/lib/centro-estilo";

// PROPS DEL COMPONENTE TARJETA DE CENTRO
interface CentroCardProps {
  centro: Centro;
  index: number;
  initialIsFavorite?: boolean;
  onToggle?: (newStatus: boolean) => void;
  ciclosFavoritosIds?: number[];
  // Modo "elegir para comparar": la tarjeta entera marca/desmarca y sustituye sus acciones
  seleccion?: { orden: number | null; bloqueada: boolean; onToggle: () => void };
}

// DEFINICIÓN DE ANIMACIONES FRAMER MOTION
const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, 
      damping: 15,    
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    transition: { duration: 0.2 } 
  },
  hover: {
    y: -2,
    transition: { duration: 0.2 }
  }
};

// COMPONENTE PRINCIPAL: TARJETA DE CENTRO INDIVIDUAL
// Muestra la información resumida de un centro y gestiona la acción de favoritos
export default function CentroCard({
  centro,
  index,
  initialIsFavorite = false,
  onToggle,
  ciclosFavoritosIds = [],
  seleccion,
}: CentroCardProps) {
  const searchParams = useSearchParams();
  const { isFavorite, toggleFavorite, loading } = useFavorite({
    centro,
    initialIsFavorite,
    onToggle
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Datos ya formateados para lectura (el dataset oficial viene en mayúsculas y con el tipo repetido)
  const nombre = centroName(centro);
  const lugar = centroLugar(centro);
  const etapas = centroEtapas(denominacionDe(centro));
  const distancia = centro.distancia ?? centro.distance;
  const totalCiclos = centro.ciclos_count ?? centro.ciclos?.length ?? 0;
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construir URL del centro con el filtro de nivel si existe
  const nivelParam = searchParams.get('nivel');
  const centroUrl = nivelParam
    ? `/centro/${centro.id}?nivel=${nivelParam}`
    : `/centro/${centro.id}`;

  // Close share menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getShareUrl = () => `${window.location.origin}/centro/${centro.id}`;

  const handleToggleShareMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 1500);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `Mira este centro que he encontrado en EduFinder CyL:\n\n${nombre}\n${centroLugar(centro)}\n\nEchale un vistazo: ${getShareUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareNative = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: nombre,
          text: `${nombre} - ${centroLugar(centro)}`,
          url: getShareUrl(),
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
    setShowShareMenu(false);
  }; 

  // Ciclos a mostrar: primero los favoritos del usuario (máx. 3)
  const ciclosVisibles = [...(centro.ciclos ?? [])]
    .sort((a, b) => Number(ciclosFavoritosIds.includes(b.id)) - Number(ciclosFavoritosIds.includes(a.id)))
    .slice(0, 3);
  const ciclosCargados = centro.ciclos?.length ?? 0;
  const ciclosRestantes = Math.max(0, ciclosCargados - ciclosVisibles.length);
  // Con un filtro de FP activo, los ciclos que llegan son solo los que encajan con la búsqueda
  const filtroFP = ["familia", "nivel", "ciclo", "modalidad"].some((k) => searchParams.get(k));
  const esPublico = centro.naturaleza?.toUpperCase().includes("PÚBLICO");
  const elegido = seleccion?.orden != null;
  const estilo = estiloTipo(denominacionDe(centro));
  const tipo = estilo.label;
  const TipoIcon = estilo.icon;
  const km = formatDistancia(distancia);

  return (
    <motion.div
      ref={cardRef}
      data-tour={index === 0 ? "centro-card" : undefined}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className={`group relative bg-white rounded-3xl ring-1 shadow-[0_1px_2px_rgba(34,57,69,0.06),0_8px_24px_-12px_rgba(34,57,69,0.18)] hover:shadow-[0_18px_40px_-14px_rgba(34,57,69,0.35)] transition-[box-shadow,opacity] duration-300 flex flex-col h-full ${
        elegido ? "ring-[3px] ring-blue-600" : "ring-neutral-200/80 hover:ring-[#223945]/25"
      } ${seleccion?.bloqueada ? "opacity-50" : ""}`}
    >
      {/* Toda la tarjeta navega al centro (o la elige, en modo comparar); las acciones quedan por encima */}
      {seleccion ? (
        <button
          type="button"
          onClick={seleccion.onToggle}
          disabled={seleccion.bloqueada}
          aria-pressed={elegido}
          aria-label={`${elegido ? "Quitar" : "Elegir"} ${nombre} para comparar`}
          className="absolute inset-0 z-30 rounded-3xl focus-visible:outline-none disabled:cursor-not-allowed"
        />
      ) : (
        <Link
          href={centroUrl}
          aria-label={`Ver ${nombre}`}
          className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        />
      )}

      {/* ── Cabecera: qué es, cómo es y dónde está ── */}
      <div className={`rounded-t-3xl bg-gradient-to-b ${estilo.header} to-white px-4 pt-4 pb-1 sm:px-5 sm:pt-5`}>
        <div className="flex items-start gap-3">
          <span className={`shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br ${estilo.tile} text-white flex items-center justify-center shadow-lg`}>
            <TipoIcon className="w-5 h-5" />
          </span>

          <div className="flex-1 min-w-0 pt-0.5">
            <span className={`block text-[11px] font-extrabold uppercase tracking-wider truncate ${estilo.text}`}>{tipo}</span>
            <span className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${esPublico ? "bg-blue-600 text-white" : "bg-amber-400 text-amber-950"}`}>
                {esPublico ? "Público" : centro.naturaleza ? "Privado" : "Otro"}
              </span>
              {km && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#223945]">
                  <Navigation className="w-2.5 h-2.5 fill-current" />
                  {km}
                </span>
              )}
              {(centro.favorites_count ?? 0) >= 3 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                  <Heart className="w-2.5 h-2.5 fill-current" />
                  {centro.favorites_count}
                </span>
              )}
            </span>
          </div>

          {seleccion ? (
            <span
              aria-hidden="true"
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                elegido ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "border-2 border-neutral-300 bg-white"
              }`}
            >
              {elegido && seleccion.orden}
            </span>
          ) : (
            <div data-tour={index === 0 ? "card-actions" : undefined} className="relative z-20 shrink-0 flex items-center gap-0.5 p-0.5 rounded-full bg-white/90 backdrop-blur-sm ring-1 ring-neutral-200/80 shadow-sm">
              <motion.button
                data-tour={index === 0 ? "favorite-button" : undefined}
                onClick={(e) => toggleFavorite(e, cardRef.current!)}
                whileTap={{ scale: 0.8 }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors group/heart"
                disabled={loading}
                aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
                title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                <Heart className={`w-4 h-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-neutral-400 group-hover/heart:text-red-500"}`} />
              </motion.button>

              <div className="relative" ref={shareMenuRef}>
                <motion.button
                  onClick={handleToggleShareMenu}
                  whileTap={{ scale: 0.8 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    showShareMenu ? "bg-[#223945]/10 text-[#223945]" : "text-neutral-400 hover:bg-[#223945]/5 hover:text-[#223945]"
                  }`}
                  aria-label="Compartir centro"
                  title="Compartir"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-50"
                  >
                    <div className="p-1">
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center">
                          {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                        </div>
                        <span className="text-xs font-medium text-neutral-700">
                          {copied ? '¡Copiado!' : 'Copiar enlace'}
                        </span>
                      </button>
                      <button
                        onClick={handleShareWhatsApp}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-neutral-700">WhatsApp</span>
                      </button>
                      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                        <button
                          onClick={handleShareNative}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Share2 className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-xs font-medium text-neutral-700">Más opciones...</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              <AddToCompareButton centro={centro} />
            </div>
          )}
        </div>

        <h3 className="mt-3.5 !text-[1.2rem] sm:!text-xl !font-extrabold !leading-tight tracking-tight !text-[#111827] line-clamp-2 group-hover:!text-[#223945] transition-colors" title={nombre}>
          {nombre}
        </h3>
        <span className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-500 min-w-0">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span className="truncate">{lugar}</span>
        </span>
      </div>

      {/* ── Qué se puede estudiar + ir al centro ── */}
      <div className="px-4 pt-3 pb-4 sm:px-5 sm:pb-5 flex-1 flex flex-col">
        {ciclosVisibles.length > 0 && (
          <>
            {filtroFP && totalCiclos > ciclosCargados && (
              <span className="mb-2 self-start inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                <Check className="w-3 h-3" strokeWidth={3} />
                {ciclosCargados} de {totalCiclos} ciclos encajan con tu búsqueda
              </span>
            )}
            <ul className="space-y-1.5">
              {ciclosVisibles.map((ciclo) => {
                const isFav = ciclosFavoritosIds.includes(ciclo.id);
                const nivel = nivelFP(ciclo.nivel_educativo);
                return (
                  <li key={ciclo.id} className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl ${isFav ? "bg-rose-50" : "bg-neutral-50"}`}>
                    <span className={`shrink-0 w-9 text-center py-0.5 rounded-lg text-[10px] font-extrabold ${nivel?.solid ?? "bg-neutral-600 text-white"}`}>
                      {nivel?.abbr ?? "FP"}
                    </span>
                    <span className="truncate flex-1 text-[13px] font-semibold text-neutral-800">{ciclo.ciclo_formativo}</span>
                    {isFav && <Heart className="w-3.5 h-3.5 shrink-0 fill-rose-500 text-rose-500" aria-label="Ciclo guardado" />}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {seleccion ? (
          <>
          {ciclosVisibles.length > 0 && <span aria-hidden="true" className="h-3 shrink-0" />}
          <span
            className={`mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              elegido ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" : "bg-white text-[#223945] ring-1 ring-neutral-200"
            }`}
          >
            {elegido ? <Check className="w-4 h-4" strokeWidth={3} /> : <Plus className="w-4 h-4" />}
            {elegido ? "Elegido para comparar" : seleccion.bloqueada ? "Ya tienes 3 elegidos" : "Elegir para comparar"}
          </span>
          </>
        ) : (
          <div className={`mt-auto flex items-center gap-3 ${ciclosVisibles.length > 0 ? "pt-3" : ""}`}>
            <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
              {ciclosVisibles.length > 0 ? (
                ciclosRestantes > 0 && (
                  <span className="text-xs font-semibold text-neutral-500">
                    + {ciclosRestantes} {ciclosRestantes === 1 ? "ciclo más" : "ciclos más"}
                  </span>
                )
              ) : (
                <>
                  {etapas.map((e) => (
                    <span key={e} className={`px-2.5 py-1 rounded-lg ring-1 text-xs font-bold ${estilo.chip}`}>{e}</span>
                  ))}
                  {totalCiclos > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#223945] text-white text-xs font-bold">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {totalCiclos} {totalCiclos === 1 ? "ciclo de FP" : "ciclos de FP"}
                    </span>
                  )}
                </>
              )}
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 h-9 pl-4 pr-3 rounded-full bg-[#223945] text-white text-[13px] font-bold shadow-md shadow-[#223945]/20 group-hover:bg-gradient-to-r group-hover:from-[#223945] group-hover:to-blue-700 transition-all">
              Ver centro
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
