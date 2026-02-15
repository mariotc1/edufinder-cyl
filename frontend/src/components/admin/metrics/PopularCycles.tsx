'use client';

import { TrendingUp, Search, ArrowUpRight } from 'lucide-react';

interface PopularCyclesProps {
    data: any[];
}

export default function PopularCycles({ data }: PopularCyclesProps) {


    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500"></div>

          <div className="p-6 pb-2">
            <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Ciclos Más Buscados
            </h3>
            <p className="text-sm text-slate-500">Tendencias de búsqueda</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-3 mt-4">
                  {(!data || data.length === 0) && (
                      <div className="flex flex-col items-center justify-center h-32 text-slate-300">
                          <div className="p-3 bg-slate-50 rounded-full mb-2">
                             <Search className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-medium">Sin búsquedas registradas</p>
                      </div>
                  )}
                  {data?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                              <div className={`
                                  w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm
                                  ${index === 0 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700' : 
                                    index === 1 ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700' :
                                    index === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800' : 'bg-slate-50 text-slate-500'}
                              `}>
                                  {index + 1}
                              </div>
                              <span className="text-xs font-semibold text-slate-600 truncate group-hover:text-blue-600 transition-colors">
                                  {item.query}
                              </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full shadow-sm">
                              {item.total} <Search className="w-2.5 h-2.5" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>
    );
}
