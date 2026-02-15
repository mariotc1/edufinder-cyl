'use client';

import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye } from 'lucide-react';

interface VisitsChartProps {
    data: any[];
    type: 'users' | 'visits';
}

export default function VisitsChart({ data, type }: VisitsChartProps) {
    const isUsers = type === 'users';
    
    // Transform data for Recharts if needed (dates are strings 'YYYY-MM-DD')
    const chartData = data?.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    })) || [];

    const color = isUsers ? '#3b82f6' : '#10b981';
    const gradientId = isUsers ? 'colorUsers' : 'colorVisits';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 relative h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>
            
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[#223945] flex items-center gap-2">
                    {isUsers ? <Users className="w-5 h-5 text-blue-500" /> : <Eye className="w-5 h-5 text-emerald-500" />}
                    {isUsers ? 'Nuevos Registros' : 'Visitas a Centros'}
                </h3>
                <p className="text-sm text-slate-500">Últimos 7 días</p>
            </div>
            
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            allowDecimals={false}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                            itemStyle={{ color: '#223945', fontWeight: 'bold' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke={color} 
                            fillOpacity={1} 
                            fill={`url(#${gradientId})`} 
                            strokeWidth={2}
                            
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
