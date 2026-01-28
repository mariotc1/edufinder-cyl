'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, Building2, Star } from 'lucide-react';

interface Centro {
    id: number;
    nombre: string;
    latitud: number;
    longitud: number;
    tipo: string;
    direccion: string;
}

interface MapProps {
    centros: Centro[];
    userLocation: { lat: number, lon: number } | null;
    radius: number;
}

// Function to generate Custom Icons (Google Maps Pointed Style)
const createCustomIcon = (type: string) => {
    // Determine color based on type (public vs private/concertado)
    // User requested UNIFIED Dark Blue (#223945) for all icons to match the app theme, regardless of type.
    const colorHex = '#223945'; 

    // A nicer, sharper "Teardrop/Pin" SVG shape
    const iconMarkup = renderToStaticMarkup(
        <div className="relative group" style={{ width: '40px', height: '40px' }}>
            {/* Shadow Effect at bottom */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/30 rounded-[50%] blur-[2px] transition-all group-hover:w-6 group-hover:blur-[3px]"></div>
            
            {/* Main Pin Shape - using SVG for crisp sharpness */}
            <svg 
                viewBox="0 0 32 43" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 drop-shadow-md transform origin-bottom transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110"
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
        iconSize: [40, 48], // Match SVG aspect ratio roughly 
        iconAnchor: [20, 48], // Tip of the pin is at bottom center
        popupAnchor: [0, -50] // Popup should open well above the pin
    });
};

const UserIcon = L.divIcon({
    html: renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-8 h-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
            <div className="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
        </div>
    ),
    className: 'user-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

function MapController({ userLocation, radius }: { userLocation: { lat: number, lon: number } | null, radius: number }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
        map.flyTo([userLocation.lat, userLocation.lon], 10, {
            duration: 1.5
        });
    }
  }, [userLocation, map]);

  return null;
}

export default function Map({ centros, userLocation, radius }: MapProps) {
    const defaultCenter: [number, number] = [41.652, -4.728]; // Valladolid center

    return (
        <MapContainer 
            center={defaultCenter} 
            zoom={8} 
            scrollWheelZoom={true} 
            className="h-full w-full z-0 outline-none bg-neutral-100" // Added bg color
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                // Voyager usually has good local labels. If English persists, we can try OSM DE or specialized tiles, but Voyager is generally best for UI.
            />
            
            <MapController userLocation={userLocation} radius={radius} />

            {/* Radius Circle */}
            {userLocation && (
                <Circle 
                    center={[userLocation.lat, userLocation.lon]}
                    radius={radius * 1000} // Convert km to meters
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
                />
            )}

            {/* User Location Marker */}
            {userLocation && (
                 <Marker position={[userLocation.lat, userLocation.lon]} icon={UserIcon}>
                     <Popup>
                         <div className="text-center p-1">
                             <span className="font-bold text-neutral-700">Tu Ubicación</span>
                         </div>
                     </Popup>
                 </Marker>
            )}

            {/* Center Markers */}
            {centros.map((centro) => (
                (centro.latitud && centro.longitud) ? (
                    <Marker 
                        key={centro.id} 
                        position={[centro.latitud, centro.longitud]}
                        icon={createCustomIcon('default')}
                    >
                        <Popup className="premium-popup">
                            <div className="min-w-[200px] p-1">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-neutral-100 rounded-lg shrink-0">
                                        <Building2 className="w-5 h-5 text-[#223945]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#223945] text-sm leading-tight mb-1">{centro.nombre}</h3>
                                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">{centro.tipo}</p>
                                    </div>
                                </div>
                                
                                <div className="text-xs text-neutral-600 mb-3 line-clamp-2">
                                    {centro.direccion || 'Sin dirección disponible'}
                                </div>

                                <Link 
                                    href={`/centro/${centro.id}`} 
                                    className="block w-full text-center py-2 bg-[#223945] text-white text-xs font-bold rounded-lg hover:bg-[#1a2c35] transition-colors"
                                >
                                    Ver Ficha Completa
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
}
