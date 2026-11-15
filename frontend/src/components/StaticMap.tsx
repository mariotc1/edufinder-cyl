'use client';

// MAPA ESTÁTICO LIGERO
// Compone las teselas de OpenStreetMap alrededor de un punto, sin Leaflet.
// Pensado para móvil: carga al instante y no captura el gesto de scroll como un mapa interactivo.

const TILE = 256;

interface StaticMapProps {
    lat: number;
    lng: number;
    zoom?: number;
    className?: string;
}

// Coordenadas de tesela (con decimales) para lat/lng en un zoom dado (proyección Web Mercator)
function toTile(lat: number, lng: number, zoom: number) {
    const n = 2 ** zoom;
    const x = ((lng + 180) / 360) * n;
    const latRad = (lat * Math.PI) / 180;
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    return { x, y };
}

export default function StaticMap({ lat, lng, zoom = 16, className = '' }: StaticMapProps) {
    const { x, y } = toTile(lat, lng, zoom);
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    // Desplazamiento del punto dentro de su tesela, en píxeles
    const ox = (x - tx) * TILE;
    const oy = (y - ty) * TILE;

    // Rejilla de 5x3 teselas centrada en la del punto: cubre hasta ~1000px de ancho
    const tiles: { key: string; src: string; left: number; top: number }[] = [];
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const sub = 'abc'[Math.abs(tx + dx + ty + dy) % 3];
            tiles.push({
                key: `${dx}:${dy}`,
                src: `https://${sub}.tile.openstreetmap.org/${zoom}/${tx + dx}/${ty + dy}.png`,
                left: dx * TILE - ox,
                top: dy * TILE - oy,
            });
        }
    }

    return (
        <div className={`relative overflow-hidden bg-[#e8eaed] ${className}`} aria-label="Mapa de la ubicación del centro" role="img">
            {/* Origen de la rejilla en el centro del contenedor: el punto queda siempre centrado */}
            <div className="absolute left-1/2 top-1/2">
                {tiles.map(t => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={t.key}
                        src={t.src}
                        alt=""
                        width={TILE}
                        height={TILE}
                        loading="lazy"
                        draggable={false}
                        className="absolute max-w-none select-none"
                        style={{ left: t.left, top: t.top }}
                    />
                ))}
            </div>

            {/* Pin del centro: el mismo marcador que en la vista Mapa */}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1.5 rounded-[50%] bg-black/30 blur-[2px] pointer-events-none" />
            <svg
                viewBox="0 0 32 43"
                fill="none"
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full w-10 h-[54px] drop-shadow-md pointer-events-none"
            >
                <path
                    d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 43 16 43C16 43 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z"
                    fill="#223945"
                    stroke="white"
                    strokeWidth="1.5"
                />
                <circle cx="16" cy="16" r="6" fill="white" />
            </svg>

            <span className="absolute bottom-1 right-1.5 text-[9px] text-neutral-600 bg-white/70 px-1 rounded">© OpenStreetMap</span>
        </div>
    );
}
