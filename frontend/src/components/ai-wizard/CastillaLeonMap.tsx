'use client';

import { motion } from 'framer-motion';

// Paths reales extraídos del SVG oficial de Wikimedia Commons
// Simplificados con algoritmo Douglas-Peucker manteniendo la forma geográfica real
const provincias = [
    {
        id: 'LEON',
        name: 'León',
        center: { x: 60, y: 52 },
        path: 'M37.2,63.4 L38.7,59.7 L36.0,58.1 L36.6,55.0 L30.3,54.2 L31.3,47.8 L36.2,44.5 L36.6,40.4 L45.8,40.6 L49.2,35.8 L52.5,37.7 L56.1,35.6 L63.0,39.7 L65.6,36.6 L69.7,38.1 L74.0,35.4 L80.7,35.4 L81.5,32.7 L86.1,30.9 L90.0,37.5 L84.5,48.0 L86.1,49.2 L85.1,60.4 L81.5,64.7 L79.8,62.8 L76.0,66.3 L72.7,65.7 L72.7,72.1 L69.1,69.8 L67.5,71.5 L65.6,68.4 L58.1,68.8 L37.2,63.4 Z'
    },
    {
        id: 'PALENCIA',
        name: 'Palencia',
        center: { x: 96, y: 60 },
        path: 'M82.5,63.6 L85.1,60.4 L85.5,44.1 L89.4,38.7 L97.1,37.3 L102.2,40.8 L102.8,44.7 L104.4,43.9 L103.6,45.9 L106.2,47.8 L100.7,50.0 L102.0,58.3 L99.5,59.5 L102.8,69.6 L108.7,73.1 L107.0,75.8 L110.7,74.4 L105.6,78.7 L106.6,82.2 L101.8,80.6 L96.1,82.4 L95.7,79.5 L93.2,80.6 L90.6,77.5 L87.6,80.1 L85.7,76.2 L82.3,75.8 L84.9,71.1 L84.3,68.6 L81.9,68.4 L82.5,63.6 Z'
    },
    {
        id: 'BURGOS',
        name: 'Burgos',
        center: { x: 118, y: 63 },
        path: 'M132.4,40.2 L133.0,42.8 L127.7,41.4 L126.1,43.7 L128.1,45.7 L130.4,43.4 L129.6,48.0 L132.2,47.8 L136.9,52.1 L131.2,52.1 L130.0,55.6 L132.2,58.9 L130.0,67.4 L135.4,72.7 L133.0,78.3 L129.0,81.6 L126.1,78.3 L126.3,82.4 L121.6,88.6 L116.2,89.4 L114.3,93.3 L113.7,90.2 L112.1,92.3 L106.8,87.4 L105.4,79.9 L110.7,74.4 L107.0,75.8 L108.7,73.1 L102.8,69.6 L99.5,59.5 L102.0,58.3 L100.9,49.8 L112.7,46.5 L112.3,43.7 L110.1,43.2 L112.3,41.6 L108.5,42.0 L112.1,36.6 L117.0,33.3 L121.2,35.0 L129.2,33.3 L129.0,38.9 L132.4,40.2 Z'
    },
    {
        id: 'SORIA',
        name: 'Soria',
        center: { x: 142, y: 88 },
        path: 'M162.4,75.2 L164.5,84.5 L159.2,88.0 L160.6,94.8 L158.4,95.6 L156.3,93.3 L154.7,97.7 L157.8,106.5 L155.7,104.9 L148.2,106.9 L143.8,103.6 L144.0,101.2 L137.9,100.1 L136.3,97.7 L132.0,99.5 L127.9,98.5 L124.3,95.4 L124.9,92.9 L119.6,90.0 L119.2,88.2 L121.6,88.6 L126.3,82.4 L126.1,78.3 L129.4,81.4 L139.1,70.0 L140.7,70.7 L139.7,74.0 L144.0,74.4 L145.6,70.2 L150.7,69.2 L151.9,71.3 L155.5,70.9 L155.9,75.6 L159.4,77.0 L162.4,75.2 Z'
    },
    {
        id: 'ZAMORA',
        name: 'Zamora',
        center: { x: 53, y: 84 },
        path: 'M69.3,70.0 L70.7,74.4 L72.5,72.1 L75.8,74.2 L73.8,75.6 L75.2,79.9 L72.1,81.8 L76.2,90.0 L73.1,91.5 L73.6,104.1 L64.8,99.5 L58.1,99.7 L57.1,102.8 L54.5,99.9 L52.5,101.0 L43.7,97.2 L51.6,87.6 L48.8,84.5 L42.3,83.0 L42.3,73.8 L39.1,74.6 L36.2,72.3 L32.8,74.0 L30.7,69.2 L37.2,63.2 L58.1,68.8 L65.6,68.4 L67.5,71.5 L69.3,70.0 Z'
    },
    {
        id: 'VALLADOLID',
        name: 'Valladolid',
        center: { x: 90, y: 84 },
        path: 'M72.7,72.1 L72.7,65.7 L82.5,63.6 L81.9,68.4 L84.3,68.6 L84.9,71.1 L82.7,76.8 L85.7,76.2 L87.6,80.1 L91.0,77.5 L93.2,80.6 L95.7,79.5 L96.1,82.4 L104.6,80.8 L106.6,82.2 L107.8,90.9 L94.5,94.4 L95.5,98.5 L92.2,97.5 L91.4,102.6 L86.1,105.1 L73.1,102.0 L73.1,91.5 L76.2,90.0 L72.1,82.0 L75.2,79.9 L73.8,75.6 L75.8,74.2 L72.7,72.1 Z'
    },
    {
        id: 'SEGOVIA',
        name: 'Segovia',
        center: { x: 108, y: 105 },
        path: 'M119.4,89.0 L124.9,92.9 L124.3,95.4 L127.9,98.5 L126.7,100.1 L122.7,99.5 L122.9,101.6 L110.1,110.0 L107.8,116.4 L96.5,121.4 L88.8,104.3 L91.4,102.6 L92.2,97.5 L95.5,98.5 L94.3,94.6 L106.2,91.7 L108.3,88.6 L112.1,92.3 L113.7,90.2 L114.3,93.3 L116.2,89.4 L119.4,89.0 Z'
    },
    {
        id: 'SALAMANCA',
        name: 'Salamanca',
        center: { x: 55, y: 115 },
        path: 'M74.4,102.0 L78.4,103.6 L78.6,111.7 L70.9,121.8 L67.9,122.4 L67.5,124.0 L70.1,123.2 L69.1,126.7 L67.5,128.2 L64.8,126.5 L61.6,132.5 L60.2,130.2 L55.1,132.1 L49.4,125.3 L39.7,132.3 L32.2,132.1 L34.6,129.0 L33.0,125.7 L34.8,111.5 L31.6,106.1 L34.8,105.5 L39.3,98.5 L46.8,97.5 L57.1,102.8 L58.7,99.5 L64.8,99.5 L73.1,104.1 L74.4,102.0 Z'
    },
    {
        id: 'AVILA',
        name: 'Ávila',
        center: { x: 82, y: 121 },
        path: 'M78.4,103.8 L82.1,102.8 L85.1,105.3 L89.0,103.4 L96.5,121.4 L102.6,119.3 L103.2,122.0 L99.7,121.6 L98.9,129.2 L95.9,129.6 L95.3,132.3 L92.8,131.7 L92.4,135.8 L86.1,133.7 L82.9,138.5 L79.0,137.9 L75.6,140.1 L72.1,138.9 L72.1,133.7 L66.9,136.0 L61.8,132.3 L64.8,126.5 L67.5,128.2 L69.1,126.7 L70.1,123.2 L67.5,124.0 L67.9,122.4 L70.9,121.8 L77.4,114.6 L78.4,103.8 Z'
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
            <svg
                viewBox="25 28 145 118"
                className="w-full h-auto max-h-[220px]"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            >
                <defs>
                    <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#223945" />
                        <stop offset="100%" stopColor="#2d5a7b" />
                    </linearGradient>
                </defs>

                {provincias.map((provincia) => {
                    const isSelected = selectedProvincias.includes(provincia.id);

                    return (
                        <g key={provincia.id}>
                            <motion.path
                                d={provincia.path}
                                initial={false}
                                animate={{
                                    fill: isSelected ? 'url(#selectedGradient)' : '#f1f5f9',
                                    stroke: isSelected ? '#1a2f3d' : '#94a3b8',
                                    strokeWidth: isSelected ? 1.2 : 0.5,
                                }}
                                whileHover={!disabled ? {
                                    fill: isSelected ? 'url(#selectedGradient)' : '#e2e8f0',
                                    strokeWidth: 0.8,
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

{/* Nombre solo visible en hover con tooltip */}
                        </g>
                    );
                })}
            </svg>

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
