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

// Function to generate Custom Icons
const createCustomIcon = (type: string) => {
    const iconMarkup = renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-10 h-10 group">
            <div className="absolute inset-0 bg-[#223945] rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300 border-2 border-white"></div>
            <div className="absolute bottom-0 translate-y-1/2 rotate-45 w-3 h-3 bg-[#223945] border-r-2 border-b-2 border-white"></div>
            <MapPin className="relative z-10 w-5 h-5 text-white" />
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
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
            className="h-full w-full z-0 outline-none"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
