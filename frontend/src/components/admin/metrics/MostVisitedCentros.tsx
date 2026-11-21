import { School, Eye } from 'lucide-react';

interface MostVisitedCentrosProps {
    data: any[];
}

export default function MostVisitedCentros({ data }: MostVisitedCentrosProps) {
    const top = data?.slice(0, 5) || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

          <div className="p-6 pb-2 shrink-0">
            <h3 className="text-lg font-bold text-[#223945]">Centros más Visitados</h3>
            <p className="text-xs text-slate-500 font-medium">Fichas de centro más vistas</p>
          </div>

          <div className="flex-1 px-6 pb-6 pt-4 flex flex-col justify-center min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-3">
                  {top.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                          <div className="p-3 bg-slate-50 rounded-full mb-2">
                             <Eye className="w-6 h-6 opacity-30" />
                          </div>
                          <p className="text-sm font-medium">Sin datos disponibles</p>
                      </div>
                  )}
                  {top.map((item, index) => (
                      <div key={item.centro_id ?? index} className="flex items-center justify-between group p-3 rounded-2xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 hover:shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-50 border-emerald-100 text-emerald-600">
                                  <School className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-bold text-[#223945] truncate group-hover:text-blue-700 transition-colors">
                                  {item.centro?.nombre || 'Centro eliminado'}
                              </span>
                          </div>
                          <span className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-50/50 text-emerald-700 text-[10px] font-black border border-emerald-100 group-hover:bg-emerald-100 transition-colors uppercase tracking-wide">
                              {item.total} {item.total === 1 ? 'visita' : 'visitas'}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
        </div>
    );
}
