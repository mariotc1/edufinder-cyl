import { TrendingUp, Search, Trophy } from 'lucide-react';

interface PopularCyclesProps {
    data: any[];
}

export default function PopularCycles({ data }: PopularCyclesProps) {
    // Top 3 strict limit (Gold, Silver, Bronze)
    const topCycles = data?.slice(0, 3) || [];

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-600 fill-yellow-100" />;
        if (index === 1) return <Trophy className="w-5 h-5 text-slate-500 fill-slate-100" />;
        if (index === 2) return <Trophy className="w-5 h-5 text-orange-600 fill-orange-100" />;
        return null;
    };

    const getRankStyles = (index: number) => {
         if (index === 0) return 'bg-yellow-50 border-yellow-100 text-yellow-700 shadow-sm ring-1 ring-yellow-100/50';
         if (index === 1) return 'bg-slate-50 border-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-100/50';
         if (index === 2) return 'bg-orange-50 border-orange-100 text-orange-800 shadow-sm ring-1 ring-orange-100/50';
         return '';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
          {/* Top Gradient matching other widgets */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

          <div className="p-6 pb-2 shrink-0">
            <h3 className="text-lg font-bold text-[#223945]">Ciclos más Buscados</h3>
            <p className="text-xs text-slate-500 font-medium">Tendencias de búsqueda</p>
          </div>

          <div className="flex-1 px-6 pb-6 pt-4 flex flex-col justify-center min-h-0">
              <div className="flex flex-col gap-4">
                  {(!topCycles || topCycles.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                          <div className="p-3 bg-slate-50 rounded-full mb-2">
                             <Search className="w-6 h-6 opacity-30" />
                          </div>
                          <p className="text-sm font-medium">Sin datos disponibles</p>
                      </div>
                  )}
                  {topCycles.map((item, index) => (
                      <div key={index} className="flex items-center justify-between group p-3 rounded-2xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 hover:shadow-sm">
                          <div className="flex items-center gap-4 min-w-0">
                              <div className={`
                                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                                  ${getRankStyles(index)}
                              `}>
                                  {getRankIcon(index)}
                              </div>
                              <span className="text-sm font-bold text-[#223945] truncate group-hover:text-blue-700 transition-colors">
                                  {item.query}
                              </span>
                          </div>
                          <div className="shrink-0 flex items-center">
                               <span className="px-3 py-1.5 rounded-lg bg-blue-50/50 text-blue-600 text-[10px] font-black border border-blue-100 group-hover:bg-blue-100 transition-colors uppercase tracking-wide">
                                   {item.total} {item.total === 1 ? 'búsqueda' : 'búsquedas'}
                               </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>
    );
}
