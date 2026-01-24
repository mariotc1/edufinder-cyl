'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import Link from 'next/link';
import { useEffect } from 'react';

interface Centro {
    id: number;
    nombre: string;
    latitud: number;
    longitud: number;
}

interface MapProps {
    centros: Centro[];
    center?: [number, number];
    zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Map({ centros, center = [41.652, -4.728], zoom = 8 }: MapProps) {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full rounded-lg z-0">
            <ChangeView center={center} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {centros.map((centro) => (
                (centro.latitud && centro.longitud) ? (
                    <Marker key={centro.id} position={[centro.latitud, centro.longitud]}>
                        <Popup>
                            <div className="text-slate-900">
                                <strong className="block mb-1">{centro.nombre}</strong>
                                <Link href={`/centro/${centro.id}`} className="text-blue-600 hover:underline">
                                    Ver detalles
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
}
