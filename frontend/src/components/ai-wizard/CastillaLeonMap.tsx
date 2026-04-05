'use client';

import { motion } from 'framer-motion';

// Datos de las provincias con sus paths SVG simplificados
const provincias = [
    {
        id: 'LEON',
        name: 'León',
        path: 'M85,45 L120,30 L165,35 L180,55 L175,90 L155,120 L120,135 L85,125 L60,100 L55,70 Z',
        center: { x: 115, y: 80 }
    },
    {
        id: 'PALENCIA',
        name: 'Palencia',
        path: 'M180,55 L220,45 L250,60 L255,95 L240,125 L200,130 L175,120 L175,90 Z',
        center: { x: 215, y: 90 }
    },
    {
        id: 'BURGOS',
        name: 'Burgos',
        path: 'M250,60 L295,40 L350,50 L365,85 L355,130 L310,145 L270,140 L255,125 L255,95 Z',
        center: { x: 305, y: 95 }
    },
    {
        id: 'SORIA',
        name: 'Soria',
        path: 'M355,130 L365,85 L395,90 L420,110 L415,160 L380,180 L345,170 L340,145 Z',
        center: { x: 380, y: 135 }
    },
    {
        id: 'ZAMORA',
        name: 'Zamora',
        path: 'M55,100 L85,125 L120,135 L125,175 L100,210 L55,205 L35,165 L40,125 Z',
        center: { x: 80, y: 165 }
    },
    {
        id: 'VALLADOLID',
        name: 'Valladolid',
        path: 'M120,135 L175,120 L200,130 L210,170 L185,205 L145,210 L125,190 L125,175 Z',
        center: { x: 165, y: 170 }
    },
    {
        id: 'SEGOVIA',
        name: 'Segovia',
        path: 'M240,125 L270,140 L310,145 L320,175 L295,215 L250,220 L220,200 L210,170 L220,145 Z',
        center: { x: 265, y: 180 }
    },
    {
        id: 'SALAMANCA',
        name: 'Salamanca',
        path: 'M35,165 L55,205 L100,210 L125,250 L105,295 L55,300 L25,265 L20,215 Z',
        center: { x: 70, y: 250 }
    },
    {
        id: 'AVILA',
        name: 'Ávila',
        path: 'M100,210 L145,210 L185,205 L220,200 L230,240 L200,285 L150,295 L125,280 L105,295 L125,250 Z',
        center: { x: 165, y: 250 }
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
        <div className="relative w-full max-w-md mx-auto">
            {/* Leyenda */}
            <div className="flex items-center justify-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-neutral-200 border border-neutral-300"></div>
                    <span className="text-neutral-500">Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#223945]"></div>
                    <span className="text-neutral-500">Seleccionada</span>
                </div>
            </div>

            {/* SVG del mapa */}
            <svg
                viewBox="0 0 440 340"
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
            >
                {/* Definiciones */}
                <defs>
                    {/* Gradiente para provincias seleccionadas */}
                    <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#223945" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>

                    {/* Sombra */}
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                    </filter>
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
                                    fill: isSelected ? 'url(#selectedGradient)' : '#e5e7eb',
                                    stroke: isSelected ? '#1e3a5f' : '#9ca3af',
                                    strokeWidth: isSelected ? 2.5 : 1.5,
                                    scale: isSelected ? 1.02 : 1,
                                }}
                                whileHover={!disabled ? {
                                    fill: isSelected ? 'url(#selectedGradient)' : '#d1d5db',
                                    scale: 1.03,
                                    transition: { duration: 0.2 }
                                } : {}}
                                whileTap={!disabled ? { scale: 0.98 } : {}}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                onClick={() => !disabled && onToggleProvincia(provincia.id)}
                                style={{
                                    cursor: disabled ? 'default' : 'pointer',
                                    transformOrigin: `${provincia.center.x}px ${provincia.center.y}px`,
                                    filter: isSelected ? 'url(#shadow)' : 'none'
                                }}
                                className="outline-none"
                            />

                            {/* Nombre de la provincia */}
                            <motion.text
                                x={provincia.center.x}
                                y={provincia.center.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                initial={false}
                                animate={{
                                    fill: isSelected ? '#ffffff' : '#374151',
                                    fontWeight: isSelected ? 700 : 500,
                                }}
                                transition={{ duration: 0.3 }}
                                className="text-[11px] pointer-events-none select-none"
                                style={{
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    textShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                                }}
                            >
                                {provincia.name}
                            </motion.text>
                        </g>
                    );
                })}
            </svg>

            {/* Contador de seleccionadas */}
            {selectedProvincias.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#223945]/10 text-[#223945] rounded-full text-sm font-medium">
                        <span className="w-5 h-5 bg-[#223945] text-white rounded-full text-xs flex items-center justify-center font-bold">
                            {selectedProvincias.length}
                        </span>
                        {selectedProvincias.length === 1 ? 'provincia seleccionada' : 'provincias seleccionadas'}
                    </span>
                </motion.div>
            )}
        </div>
    );
}
