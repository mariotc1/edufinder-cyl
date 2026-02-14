'use client';

import { Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ChartData {
  date: string;
  count: number;
}

export default function DashboardChart({ data }: { data: ChartData[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Transform and fill missing days
  const chartData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const result = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const found = data?.find(item => item.date === dateStr);
      result.push({
        name: days[d.getDay()],
        fullDate: dateStr,
        users: found ? found.count : 0
      });
    }
    return result;
  }, [data]);

  // Calculate dimensions and points
  const { points, areaPath, linePath } = useMemo(() => {
    if (!chartData.length) return { points: [], areaPath: '', linePath: '' };

    const maxVal = Math.max(...chartData.map(d => d.users), 5); // Minimum scale of 5 for better viz
    const width = 100;
    const height = 50;
    const padding = 2;
    
    // Normalize data to fits in 100x50 coordinate space
    const pts = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((d.users / maxVal) * (height - padding * 2)) - padding;
      return { x, y, ...d };
    });

    // Create SVG path commands
    const lineCmd = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaCmd = `${lineCmd} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

    return { points: pts, areaPath: areaCmd, linePath: lineCmd };
  }, [chartData]);


  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300 h-full flex flex-col">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-[#223945]">Crecimiento de Usuarios</h3>
          <p className="text-sm text-slate-500">Nuevos registros en los últimos 7 días</p>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full relative flex items-end justify-center pb-6">
         {/* Chart Container */}
         <div className="w-full h-full relative" onMouseLeave={() => setHoveredIndex(null)}>
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
               <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                     <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                     <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
               </defs>

               {/* Grid Lines (Horizontal) */}
               <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#f1f5f9" strokeWidth="0.5" />
               <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
               <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#f1f5f9" strokeWidth="0.5" />

               {/* Data Paths */}
               <path d={areaPath} fill="url(#gradient)" />
               <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

               {/* Interactive Points */}
               {points.map((p, i) => (
                  <g key={i}>
                     {/* Invisible click target */}
                     <rect 
                        x={p.x - 5} y="0" width="10" height="50" 
                        fill="transparent" 
                        onMouseEnter={() => setHoveredIndex(i)}
                        className="cursor-pointer"
                     />
                     {/* Visible Dot on Hover */}
                     {hoveredIndex === i && (
                        <circle cx={p.x} cy={p.y} r="2" fill="#2563eb" stroke="white" strokeWidth="1" />
                     )}
                  </g>
               ))}
            </svg>

            {/* Labels (X Axis) */}
            <div className="absolute -bottom-6 left-0 w-full flex justify-between px-2 text-[10px] text-slate-400 font-medium">
               {chartData.map((d, i) => (
                  <span key={i}>{d.name}</span>
               ))}
            </div>

            {/* Tooltip Overlay */}
            {hoveredIndex !== null && chartData[hoveredIndex] && (
               <div 
                  className="absolute p-2 bg-white rounded-lg shadow-lg border border-slate-100 text-xs z-10 pointer-events-none transition-all"
                  style={{ 
                     left: `${points[hoveredIndex].x}%`, 
                     top: `${(points[hoveredIndex].y / 50) * 100}%`,
                     transform: 'translate(-50%, -120%)'
                  }}
               >
                  <div className="font-bold text-[#223945]">{chartData[hoveredIndex].users} Usuarios</div>
                  <div className="text-slate-500 text-[10px]">{chartData[hoveredIndex].fullDate}</div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
