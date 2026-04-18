'use client';

import { motion } from 'framer-motion';

// Paths SVG más realistas de las provincias de Castilla y León
const provincias = [
    {
        id: 'LEON',
        name: 'León',
        path: 'M45,25 L58,18 L75,15 L95,12 L115,18 L130,28 L138,45 L142,65 L138,85 L128,98 L115,105 L98,108 L82,105 L68,95 L55,88 L42,78 L35,65 L32,50 L38,35 Z',
        center: { x: 88, y: 60 }
    },
    {
        id: 'PALENCIA',
        name: 'Palencia',
        path: 'M138,45 L155,38 L172,42 L185,55 L188,72 L182,88 L170,98 L155,102 L142,98 L132,88 L128,72 L132,58 Z',
        center: { x: 158, y: 70 }
    },
    {
        id: 'BURGOS',
        name: 'Burgos',
        path: 'M185,55 L205,45 L228,42 L252,48 L270,58 L278,75 L275,95 L268,112 L255,122 L238,128 L218,125 L198,118 L185,105 L178,88 L182,72 Z',
        center: { x: 228, y: 85 }
    },
    {
        id: 'SORIA',
        name: 'Soria',
        path: 'M275,95 L288,88 L305,92 L318,102 L322,118 L318,135 L308,148 L292,155 L275,152 L260,142 L255,125 L258,108 L268,98 Z',
        center: { x: 288, y: 122 }
    },
    {
        id: 'ZAMORA',
        name: 'Zamora',
        path: 'M32,78 L55,88 L68,95 L82,105 L88,118 L85,135 L78,150 L65,162 L48,168 L32,165 L18,155 L12,138 L15,118 L22,98 Z',
        center: { x: 52, y: 128 }
    },
    {
        id: 'VALLADOLID',
        name: 'Valladolid',
        path: 'M98,108 L115,105 L132,108 L148,115 L158,128 L155,145 L145,158 L128,165 L110,162 L95,152 L88,138 L88,122 Z',
        center: { x: 122, y: 135 }
    },
    {
        id: 'SEGOVIA',
        name: 'Segovia',
        path: 'M170,118 L188,112 L208,115 L228,122 L242,135 L245,152 L238,168 L222,178 L202,180 L182,175 L168,162 L162,145 L165,128 Z',
        center: { x: 205, y: 148 }
    },
    {
        id: 'SALAMANCA',
        name: 'Salamanca',
        path: 'M12,155 L32,165 L48,168 L62,175 L72,190 L68,210 L58,228 L42,238 L22,235 L8,220 L2,198 L5,175 Z',
        center: { x: 38, y: 198 }
    },
    {
        id: 'AVILA',
        name: 'Ávila',
        path: 'M78,168 L98,162 L118,165 L138,172 L158,178 L172,192 L168,212 L155,228 L135,235 L112,232 L92,222 L78,205 L72,188 Z',
        center: { x: 122, y: 198 }
    }
];

interface CastillaLeonMapProps {
    selectedProvincias: string[];
    onToggleProvincia: (provinciaId: string) => void;
    disabled?: boolean;
}

export default function CastillaLeonMap({
    selectedProvincias,
    onToggleProvincia,
    disabled = false
}: CastillaLeonMapProps) {
    return (
        <div className="relative w-full">
            {/* SVG del mapa */}
            <svg
                viewBox="0 0 330 250"
                className="w-full h-auto max-h-[180px]"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))' }}
            >
                {/* Definiciones */}
                <defs>
                    {/* Gradiente para provincias seleccionadas */}
                    <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#223945" />
                        <stop offset="100%" stopColor="#2d5a7b" />
                    </linearGradient>

                    {/* Gradiente hover */}
                    <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e0e7eb" />
                        <stop offset="100%" stopColor="#d1dbe3" />
                    </linearGradient>
                </defs>

                {/* Provincias */}
                {provincias.map((provincia) => {
                    const isSelected = selectedProvincias.includes(provincia.id);

                    return (
                        <g key={provincia.id}>
                            {/* Path de la provincia */}
                            <motion.path
                                d={provincia.path}
                                initial={false}
                                animate={{
                                    fill: isSelected ? 'url(#selectedGradient)' : '#f1f5f9',
                                    stroke: isSelected ? '#1a2f3d' : '#cbd5e1',
                                    strokeWidth: isSelected ? 2 : 1,
                                }}
                                whileHover={!disabled ? {
                                    fill: isSelected ? 'url(#selectedGradient)' : 'url(#hoverGradient)',
                                    strokeWidth: 1.5,
                                    transition: { duration: 0.15 }
                                } : {}}
                                whileTap={!disabled ? { scale: 0.98 } : {}}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                onClick={() => !disabled && onToggleProvincia(provincia.id)}
                                style={{
                                    cursor: disabled ? 'default' : 'pointer',
                                    transformOrigin: `${provincia.center.x}px ${provincia.center.y}px`,
                                }}
                                className="outline-none"
                            />

                            {/* Nombre de la provincia */}
                            <text
                                x={provincia.center.x}
                                y={provincia.center.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isSelected ? '#ffffff' : '#475569'}
                                fontWeight={isSelected ? 600 : 500}
                                className="text-[8px] pointer-events-none select-none"
                                style={{
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    textShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                                    opacity: disabled ? 0.5 : 1
                                }}
                            >
                                {provincia.name}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Pills de provincias seleccionadas */}
            {selectedProvincias.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap justify-center gap-1.5 mt-2"
                >
                    {selectedProvincias.map(id => {
                        const prov = provincias.find(p => p.id === id);
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#223945] text-white rounded-full text-[10px] font-medium"
                            >
                                {prov?.name}
                            </span>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
