import Link from "next/link";
import { MapPin, Building2, BookOpen, ArrowRight, Heart, Share2, Check, Copy, CheckCircle } from "lucide-react";
import { Centro } from "@/types";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useFavorite } from "@/hooks/useFavorite";
import AddToCompareButton from "./ui/AddToCompareButton";

// PROPS DEL COMPONENTE TARJETA DE CENTRO
interface CentroCardProps {
  centro: Centro;
  index: number;
  initialIsFavorite?: boolean;
  onToggle?: (newStatus: boolean) => void;
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
    y: -4,
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

}: CentroCardProps) {
  const { isFavorite, toggleFavorite, loading } = useFavorite({
    centro,
    initialIsFavorite,
    onToggle
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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
    const text = `Mira este centro que he encontrado en EduFinder CyL:\n\n${centro.nombre}\n${centro.localidad}, ${centro.provincia}\n\nEchale un vistazo: ${getShareUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareNative = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: centro.nombre,
          text: `${centro.nombre} - ${centro.localidad}, ${centro.provincia}`,
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

  // LÓGICA VISUAL: COLORES POR NATURALEZA (PÚBLICO, PRIVADO)
  const getNaturalezaBadge = (naturaleza: string) => {
    switch (naturaleza?.toUpperCase()) {
      case "PÚBLICO":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100";

      case "PRIVADO":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getLevelColor = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case "GRADO SUPERIOR":
        return "bg-purple-600 text-white border-purple-600 shadow-sm";

      case "GRADO MEDIO":
        return "bg-amber-500 text-white border-amber-500 shadow-sm";

      case "FP BÁSICA":
        return "bg-blue-600 text-white border-blue-600 shadow-sm";

      default:
        return "bg-neutral-600 text-white border-neutral-600";
    }
  };

  const getLevelBackground = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case "GRADO SUPERIOR":
        return "bg-purple-50 border-purple-100 group-hover:border-purple-200";

      case "GRADO MEDIO":
        return "bg-amber-50 border-amber-100 group-hover:border-amber-200";

      case "FP BÁSICA":
        return "bg-blue-50 border-blue-100 group-hover:border-blue-200";

      default:
        return "bg-neutral-50 border-neutral-100";
    }
  };

  const getLevelDotColor = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case "GRADO SUPERIOR":
        return "bg-white/80";

      case "GRADO MEDIO":
        return "bg-white/80";

      case "FP BÁSICA":
        return "bg-white/80";

      default:
        return "bg-neutral-400";
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className="group relative bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,background-color,border-color] duration-300 flex flex-col h-full"
    >
      {/* Borde decorativo superior con gradiente corporativo */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-primary-500 to-primary-300"></div>

      {/* Botones de acciones - Esquina superior derecha en fila */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        {/* Botón Favorito */}
        <motion.button
          onClick={(e) => toggleFavorite(e, cardRef.current!)}
          whileTap={{ scale: 0.8 }}
          className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-neutral-100 hover:bg-red-50 active:bg-red-100 transition-colors group/heart"
          disabled={loading}
          aria-label={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-neutral-400 group-hover/heart:text-red-500"}`}
          />
        </motion.button>

        {/* Botón Compartir con menú */}
        <div className="relative" ref={shareMenuRef}>
          <motion.button
            onClick={handleToggleShareMenu}
            whileTap={{ scale: 0.8 }}
            className={`p-1.5 rounded-full backdrop-blur-sm shadow-sm border transition-all ${
              showShareMenu
                ? "bg-[#223945]/10 border-[#223945]/30 text-[#223945]"
                : "bg-white/90 border-neutral-100 text-neutral-400 hover:bg-[#223945]/5 hover:text-[#223945] hover:border-[#223945]/20"
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

        {/* Botón Comparador */}
        <AddToCompareButton centro={centro} />
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-start mb-3 pr-20 relative z-10">
           <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getNaturalezaBadge(centro.naturaleza)}`}
              >
                {centro.naturaleza || "Otro"}
              </span>

              {centro.distancia !== undefined && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase text-white bg-[#223945] shadow-sm">
                  <MapPin className="w-3 h-3" />
                  {parseFloat(centro.distancia.toString()).toFixed(1)} km
                </span>
              )}
           </div>
        </div>

        {/* Title - polished typography with fixed height for alignment */}
        {/* Title Section - Enhanced for visual balance */}
        <div className="mb-4 min-h-[4rem] flex flex-col justify-center">
            {centro.denominacion_generica && (
                <span className="text-[10px] font-bold text-[#223945]/70 uppercase tracking-widest leading-tight block mb-1">
                    {centro.denominacion_generica}
                </span>
            )}
            <h3 className="text-xl font-black text-[#111827] group-hover:text-[#223945] transition-colors line-clamp-2 tracking-tight leading-none">
                {centro.nombre}
            </h3>
        </div>

        {/* Info Icons - fixed height for alignment */}
        <div className="space-y-2.5 mb-5 min-h-[4.5rem]">
          <div className="flex items-start gap-2.5 text-neutral-600 group/item">
            <div className="p-1.5 bg-[#223945] rounded-md shrink-0 mt-0.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[15px] font-medium leading-relaxed line-clamp-2">
              <span className="font-bold text-[#223945] block text-xs uppercase tracking-wider mb-0.5 opacity-80">Ubicación</span>
              {centro.localidad}{" "}
              <span className="text-neutral-400 font-normal">({centro.provincia})</span>
            </p>
          </div>

          <div className="flex items-start gap-2.5 text-neutral-600 group/item">
            <div className="p-1.5 bg-[#223945] rounded-md shrink-0 mt-0.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[15px] font-medium leading-relaxed line-clamp-2">
              <span className="font-bold text-[#223945] block text-xs uppercase tracking-wider mb-0.5 opacity-80">Dirección</span>
              <span className="capitalize">{centro.direccion ? centro.direccion.toLowerCase() : "Sin dirección disponible"}</span>
            </p>
          </div>
        </div>

        {/* Sección de Oferta Formativa (Ciclos) - Lista con scroll limitado */}
        {centro.ciclos && centro.ciclos.length > 0 ? (
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="p-1 bg-[#223945] rounded text-white shadow-sm">
                <BookOpen className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Oferta destacada</span>
            </div>

            {/* Static height scrollable container */}
            <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#223945]/20 hover:scrollbar-thumb-[#223945]/50 scrollbar-thumb-rounded-full transition-colors">
              {centro.ciclos.map((ciclo, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-md border shadow-sm transition-colors ${getLevelBackground(ciclo.nivel_educativo)}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getLevelDotColor(ciclo.nivel_educativo)}`}></div>
                  <span className="truncate flex-1 font-medium text-neutral-800 text-sm">{ciclo.ciclo_formativo}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getLevelColor(ciclo.nivel_educativo)}`}
                  >
                    {ciclo.nivel_educativo === "Grado Superior"
                      ? "GS"
                      : ciclo.nivel_educativo === "Grado Medio"
                        ? "GM"
                        : "FPB"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-[4rem]"></div>
        )}
      </div>

      {/* Footer / Action - filled button style on hover */}
      <div className="p-3 bg-neutral-50/50 border-t border-neutral-100 group-hover:bg-white transition-colors">
        <Link
          href={`/centro/${centro.id}`}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-bold bg-[#223945] text-white shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          Explorar centro
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}