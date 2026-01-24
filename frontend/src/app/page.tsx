'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import Link from 'next/link';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Home() {
  const [search, setSearch] = useState('');
  const [provincia, setProvincia] = useState('');
  const [naturaleza, setNaturaleza] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search could be added here, for now direct
  const { data, error, isLoading } = useSWR(`/centros?page=${page}&q=${search}&provincia=${provincia}&naturaleza=${naturaleza}`, fetcher);

  const provincias = ['AVILA', 'BURGOS', 'LEON', 'PALENCIA', 'SALAMANCA', 'SEGOVIA', 'SORIA', 'VALLADOLID', 'ZAMORA'];
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 -z-10 blur-3xl"></div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 mb-6"
        >
          Encuentra tu futuro en Castilla y León
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-300 max-w-2xl mb-10"
        >
          Explora miles de centros educativos y ciclos de Formación Profesional.
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-3xl relative z-10"
        >
          <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-2xl">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar por nombre, localidad..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border-none rounded-lg text-white focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-slate-800 text-slate-300 rounded-lg px-4 py-2 border-none focus:ring-2 focus:ring-cyan-500"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
            >
              <option value="">Todas las provincias</option>
              {provincias.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select 
              className="bg-slate-800 text-slate-300 rounded-lg px-4 py-2 border-none focus:ring-2 focus:ring-cyan-500"
              value={naturaleza}
              onChange={(e) => setNaturaleza(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="PÚBLICO">Público</option>
              <option value="PRIVADO">Privado</option>
              <option value="CONCERTADO">Concertado</option>
            </select>
          </div>
        </motion.div>
      </section>

      {/* Results Section */}
      <section className="flex-grow px-4 sm:px-6 lg:px-8 py-10 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="text-cyan-400" /> Centros Educativos
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-cyan-500 h-10 w-10" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.map((centro: any) => (
                  <motion.div 
                    key={centro.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded">
                            {centro.naturaleza || 'Desconocido'}
                        </span>
                        <span className="text-xs text-slate-500">{centro.provincia}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                        {centro.nombre}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 flex-grow">
                        {centro.localidad} • {centro.denominacion_generica}
                    </p>
                    <Link 
                        href={`/centro/${centro.id}`} 
                        className="mt-auto w-full text-center bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                        Ver Ficha Completa
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-10 gap-4">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700 transition"
                  >
                      Anterior
                  </button>
                  <span className="px-4 py-2 text-slate-400">Página {page}</span>
                  <button 
                    disabled={!data?.links?.next}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700 transition"
                  >
                      Siguiente
                  </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
