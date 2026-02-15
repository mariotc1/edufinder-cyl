'use client';

import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye } from 'lucide-react';

interface VisitsChartProps {
    data: any[];
    type: 'users' | 'visits';
}

export default function VisitsChart({ data, type }: VisitsChartProps) {
    const isUsers = type === 'users';
    
    // Transform data for Recharts
    const chartData = data?.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    })) || [];

    const color = isUsers ? '#3b82f6' : '#10b981';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative h-full flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-[box-shadow,border-color] duration-300">
            {/* Top Gradient matching other widgets */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
            
            <div className="p-6 pb-2">
                <h3 className="text-lg font-bold text-[#223945]">
                    {isUsers ? 'Nuevos Registros' : 'Visitas a la Web'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Últimos 7 días</p>
            </div>
            
            <div className="flex-1 w-full min-h-[200px] px-4 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            allowDecimals={false}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                            itemStyle={{ color: '#223945', fontWeight: 'bold' }}
                        />
                        <Bar 
                            dataKey="count" 
                            fill={color} 
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                            animationDuration={1000}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
