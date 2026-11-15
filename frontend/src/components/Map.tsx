'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { memo, useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import MapPopup from '@/components/map/MapPopup';
import { Centro } from '@/types';

import { centroName } from '@/lib/centro-format';
// GENERADOR DE ICONOS PERSONALIZADOS
// Crea marcadores SVG renderizados dinámicamente para el mapa
const createCustomIcon = (type: string, title?: string) => {
    const colorHex = '#223945'; 

    const iconMarkup = renderToStaticMarkup(
        <div className="relative group" style={{ width: '40px', height: '40px' }}>
            {/* ACCESSIBILITY: Hidden Label for Screen Readers */}
            <span className="sr-only">{title || 'Marcador de mapa'}</span>

            {/* Shadow Effect at bottom */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/30 rounded-[50%] blur-[2px] transition-all group-hover:w-6 group-hover:blur-[3px]"></div>
            
            {/* Main Pin Shape - using SVG for crisp sharpness */}
            <svg 
                viewBox="0 0 32 43" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 drop-shadow-md transform origin-bottom transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110"
                aria-hidden="true"
            >
                <path 
                    d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 43 16 43C16 43 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z" 
                    fill={colorHex}
                    stroke="white" 
                    strokeWidth="1.5"
                />
                <circle cx="16" cy="16" r="6" fill="white" />
            </svg>
            
            {/* Icon inside the white circle - optional, but maybe too small. Let's keep it simple: just the white dot like standard pins, or a tiny icon. */}
            <div className="absolute top-[8px] left-1/2 -translate-x-1/2 pointer-events-none transform group-hover:-translate-y-2 transition-transform duration-300">
                {/* Could add a mini icon here if needed, but clean dot is often "Pro" */}
                {/* <MapPin className="w-4 h-4 text-[#223945]" /> */}
            </div>
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'custom-pin-marker',
        iconSize: [40, 48], 
        iconAnchor: [20, 48], 
        popupAnchor: [0, -50] 
    });
};

// El marcador es igual para todos los centros: se genera una sola vez
// (antes se renderizaba el SVG 1.700 veces en cada pintado del mapa)
const CENTRO_ICON = createCustomIcon('default');

// ICONO DE GRUPO: burbuja con el nº de centros, mayor cuantos más agrupa
const clusterIconCache = new globalThis.Map<number, L.DivIcon>();
const getClusterIcon = (count: number) => {
    const size = count < 10 ? 38 : count < 50 ? 46 : count < 200 ? 54 : 62;
    const key = size * 100000 + count;
    const cached = clusterIconCache.get(key);
    if (cached) return cached;
    const icon = L.divIcon({
        html: `<div class="map-cluster" style="width:${size}px;height:${size}px"><span>${count.toLocaleString('es-ES')}</span></div>`,
        className: 'map-cluster-wrapper',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
    clusterIconCache.set(key, icon);
    return icon;
};

const UserIcon = L.divIcon({
    html: renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-8 h-8">
            <span className="sr-only">Tu ubicación actual</span>
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
            <div className="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
        </div>
    ),
    className: 'user-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

interface MapControllerProps {
    userLocation?: { lat: number, lon: number } | null;
    radius?: number;
    center?: [number, number];
    zoom?: number;
}

// COMPONENTE DE CONTROL DEL MAPA
// Maneja movimientos de cámara (flyTo) y ajuste de bounds según ubicación/radio
function MapController({ userLocation, radius, center, zoom }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lon)) {
        map.flyTo([userLocation.lat, userLocation.lon], 14, { duration: 2.0 });
    } else if (center && Array.isArray(center) && center.length === 2) {
        const [lat, lng] = center;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            map.flyTo([lat, lng], zoom || 15, { duration: 1.5 });
        }
    }
  }, [userLocation, map, center, zoom]);

  useEffect(() => {
    if (userLocation && radius) {
       const latRadian = userLocation.lat * (Math.PI / 180);
       const metersPerDegreeLat = 111000; 
       const metersPerDegreeLon = 111000 * Math.cos(latRadian);
       
       const rMeters = radius * 1000;
       
       const deltaLat = rMeters / metersPerDegreeLat;
       const deltaLon = rMeters / metersPerDegreeLon;

       const southWest = L.latLng(userLocation.lat - deltaLat, userLocation.lon - deltaLon);
       const northEast = L.latLng(userLocation.lat + deltaLat, userLocation.lon + deltaLon);
       
       const bounds = L.latLngBounds(southWest, northEast);

       map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    }
  }, [radius, userLocation, map]);

  return null;
}

// AGRUPACIÓN DE MARCADORES
// Agrupa los centros en celdas de pantalla de CELL px según el zoom actual y solo pinta lo visible.
// A partir de MAX_CLUSTER_ZOOM se muestran todos los marcadores individuales.
const CELL = 60;
const MAX_CLUSTER_ZOOM = 15;

// pos se crea una sola vez por centro: si cambiara en cada render, react-leaflet recolocaría el marcador
// (y su ficha abierta), el mapa se desplazaría y se entraría en un bucle de renders
type PuntoCentro = { centro: Centro; lat: number; lng: number; pos: [number, number] };

// MARCADOR DE UN CENTRO (memoizado)
// Si se repintara en cada movimiento del mapa, su ficha abierta se reencuadraría (autoPan),
// eso movería el mapa otra vez y se entraría en un bucle infinito de renders
type PopupPadding = { topLeft: [number, number]; bottomRight: [number, number] };

const CentroMarker = memo(function CentroMarker({ centro, pos, isFavorite, isFocus, popupPadding }: {
    centro: Centro;
    pos: [number, number];
    isFavorite: boolean;
    isFocus: boolean;
    popupPadding: PopupPadding;
}) {
    return (
        <Marker
            position={pos}
            icon={CENTRO_ICON}
            title={centroName(centro)}
            alt={`Marcador de ${centroName(centro)}`}
            ref={(ref) => {
                if (ref && isFocus) {
                    setTimeout(() => ref.openPopup(), 500);
                }
            }}
        >
            <Popup
                className="premium-popup-container"
                closeButton={false}
                maxWidth={300}
                minWidth={260}
                autoPanPaddingTopLeft={popupPadding.topLeft}
                autoPanPaddingBottomRight={popupPadding.bottomRight}
            >
                <MapPopup centro={centro} initialIsFavorite={isFavorite} />
            </Popup>
        </Marker>
    );
});

function ClusteredMarkers({ centros, favoriteIds, focusCenterId, popupPadding }: {
    centros: Centro[];
    favoriteIds: number[];
    focusCenterId?: number;
    popupPadding: PopupPadding;
}) {
    const map = useMap();
    const [view, setView] = useState(() => ({ zoom: map.getZoom(), bounds: map.getBounds() }));
    // moveend también se dispara al terminar un zoom
    useMapEvents({
        moveend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }),
    });

    const puntos = useMemo<PuntoCentro[]>(() => centros
        .map(centro => {
            const lat = parseFloat(centro.latitud);
            const lng = parseFloat(centro.longitud);
            return { centro, lat, lng, pos: [lat, lng] as [number, number] };
        })
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)), [centros]);

    const grupos = useMemo(() => {
        const visibles = view.bounds.pad(0.3);
        const enVista = puntos.filter(p => visibles.contains([p.lat, p.lng]) || p.centro.id === focusCenterId);
        if (view.zoom >= MAX_CLUSTER_ZOOM) return enVista.map(p => [p]);

        const celdas = new globalThis.Map<string, PuntoCentro[]>();
        for (const p of enVista) {
            const px = map.project([p.lat, p.lng], view.zoom);
            const key = `${Math.floor(px.x / CELL)}:${Math.floor(px.y / CELL)}`;
            const celda = celdas.get(key);
            if (celda) celda.push(p); else celdas.set(key, [p]);
        }
        return [...celdas.values()];
    }, [puntos, view, map, focusCenterId]);

    return (
        <>
            {grupos.map(grupo => {
                if (grupo.length === 1) {
                    const { centro, pos } = grupo[0];
                    return (
                        <CentroMarker
                            key={centro.id}
                            centro={centro}
                            pos={pos}
                            isFavorite={favoriteIds.includes(centro.id)}
                            isFocus={focusCenterId === centro.id}
                            popupPadding={popupPadding}
                        />
                    );
                }
                // Centro del grupo = media de sus puntos; al tocarlo se encuadran todos sus centros
                const lat = grupo.reduce((s, p) => s + p.lat, 0) / grupo.length;
                const lng = grupo.reduce((s, p) => s + p.lng, 0) / grupo.length;
                return (
                    <Marker
                        key={`g:${grupo[0].centro.id}:${grupo.length}`}
                        position={[lat, lng]}
                        icon={getClusterIcon(grupo.length)}
                        title={`${grupo.length} centros`}
                        eventHandlers={{
                            click: () => {
                                const bounds = L.latLngBounds(grupo.map(p => [p.lat, p.lng] as [number, number]));
                                map.flyToBounds(bounds, { padding: [60, 60], maxZoom: MAX_CLUSTER_ZOOM + 1, duration: 0.6 });
                            },
                        }}
                    />
                );
            })}
        </>
    );
}

// Encaja en pantalla todos los centros recibidos (una vez, al cargarlos)
function FitToCentros({ centros }: { centros: Centro[] }) {
    const map = useMap();
    const key = centros.map(c => c.id).join(',');
    useEffect(() => {
        const pts = centros
            .map(c => [parseFloat(c.latitud), parseFloat(c.longitud)] as [number, number])
            .filter(([la, ln]) => Number.isFinite(la) && Number.isFinite(ln));
        if (pts.length === 1) map.flyTo(pts[0], 14, { duration: 1 });
        else if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 14, duration: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, map]);
    return null;
}

interface MapProps {
    centros: Centro[];
    userLocation?: { lat: number, lon: number } | null;
    radius?: number;
    center?: [number, number];
    zoom?: number;
    favoriteIds?: number[];
    focusCenterId?: number;
    fitToCentros?: boolean;
}

// COMPONENTE PRINCIPAL DE MAPA
// Wrapper de React-Leaflet con marcadores, clusters y controles
export default function Map({ centros, userLocation, radius, center, zoom, favoriteIds = [], focusCenterId, fitToCentros = false }: MapProps) {
    const defaultCenter: [number, number] = [41.652, -4.728]; // Valladolid center

    // Determinar el centro efectivo
    let effectiveCenter = defaultCenter;
    let validCenterProvided = false;

    if (center && Array.isArray(center) && center.length === 2) {
        const [lat, lng] = center;
        if (typeof lat === 'number' && typeof lng === 'number' &&
            Number.isFinite(lat) && Number.isFinite(lng)) {
            effectiveCenter = [lat, lng];
            validCenterProvided = true;
        }
    }

    const effectiveZoom = zoom || 8;

    // Margen para que la ficha emergente no quede bajo el panel lateral (escritorio) o la hoja inferior (móvil)
    const [popupPadding] = useState(() => {
        const desktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
        return desktop
            ? { topLeft: [370, 90] as [number, number], bottomRight: [30, 30] as [number, number] }
            : { topLeft: [16, 70] as [number, number], bottomRight: [16, 110] as [number, number] };
    });

    return (
        <MapContainer
            center={effectiveCenter}
            zoom={effectiveZoom}
            scrollWheelZoom={true}
            className="h-full w-full z-0 outline-none bg-neutral-100"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController userLocation={userLocation} radius={radius} center={validCenterProvided ? effectiveCenter : undefined} zoom={zoom} />

            {/* Radius Circle */}
            {userLocation && radius && (
                <Circle 
                    center={[userLocation.lat, userLocation.lon]}
                    radius={radius * 1000}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
                />
            )}

            {/* User Location Marker */}
            {userLocation && (
                 <Marker position={[userLocation.lat, userLocation.lon]} icon={UserIcon} title="Tu Ubicación">
                     <Popup>
                         <div className="text-center p-1">
                             <span className="font-bold text-neutral-700">Tu Ubicación</span>
                         </div>
                     </Popup>
                 </Marker>
            )}

             {fitToCentros && <FitToCentros centros={centros} />}

             {/* Centros (agrupados según el zoom) */}
             <ClusteredMarkers
                 centros={centros}
                 favoriteIds={favoriteIds}
                 focusCenterId={focusCenterId}
                 popupPadding={popupPadding}
             />
         </MapContainer>
    );
}