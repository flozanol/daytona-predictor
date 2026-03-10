'use client'

import React, { useMemo, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';
import {
    TrendingUp,
    Target,
    BarChart3,
    Zap,
    Filter,
    ChevronDown,
    LayoutDashboard,
    Car,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';

const COLORS = {
    background: '#020617',
    accent: '#38bdf8', // Electric Blue
    subtle: '#94a3b8',
    historical: '#64748b',
    prediction: '#38bdf8',
    confidence: 'rgba(56, 189, 248, 0.1)',
    glass: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)'
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-300 text-sm font-medium">{item.name}</span>
                            </div>
                            <span className="text-white text-sm font-black">{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                {payload.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center decoration-sky-500">
                            <span className="text-[10px] text-sky-400 font-bold uppercase">Accuracy Pace</span>
                            <span className="text-xs text-white font-black">98.2%</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const KPICard = ({ title, value, subtext, icon: Icon, trend }) => (
    <div className="relative group overflow-hidden bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Icon size={80} strokeWidth={1} />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                    <Icon size={18} />
                </div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</span>
            </div>

            <div className="flex items-end gap-3 mb-1">
                <h2 className="text-4xl font-black text-white tracking-tighter">{value}</h2>
                {trend && (
                    <span className={`text-xs font-bold mb-1.5 flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{subtext}</p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
    </div>
);

export default function PredictorDashboard({ initialStats, agencias }) {
    const [selectedAgency, setSelectedAgency] = useState('Total');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Mock data for the Main Forecast Chart
    const chartData = useMemo(() => {
        return [
            { day: '01 Mar', real: 12, predicted: null, low: null, high: null },
            { day: '02 Mar', real: 25, predicted: null, low: null, high: null },
            { day: '03 Mar', real: 38, predicted: null, low: null, high: null },
            { day: '04 Mar', real: 52, predicted: null, low: null, high: null },
            { day: '05 Mar', real: 68, predicted: null, low: null, high: null },
            { day: '06 Mar', real: 82, predicted: 82, low: 80, high: 84 }, // Today
            { day: '07 Mar', real: null, predicted: 105, low: 100, high: 110 },
            { day: '14 Mar', real: null, predicted: 190, low: 180, high: 200 },
            { day: '21 Mar', real: null, predicted: 310, low: 290, high: 330 },
            { day: '31 Mar', real: null, predicted: 485, low: 450, high: 520 },
        ];
    }, []);

    const totalForecast = 485;
    const accuracyRate = 98.4;
    const monthlyVariation = +12.5;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-sky-500/30">
            {/* Decorative Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-sky-500/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-8">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-transform hover:rotate-3">
                            <Zap size={24} className="text-white fill-current" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                                DAYTONA <span className="text-sky-400 font-light opacity-60">|</span> INTELLIGENCE
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Predictive Analytics Engine</span>
                                <div className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-[9px] font-black text-sky-400 uppercase tracking-widest">
                                    Powered by Antigravity AI
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-1.5 flex items-center gap-1 group">
                            {['Agencia', 'Modelo', 'Tiempo'].map((filter) => (
                                <button key={filter} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
                                    {filter}
                                    <ChevronDown size={14} className="opacity-40 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                        <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />
                        <div className="flex items-center gap-3 bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-2xl">
                            <ShieldCheck size={16} className="text-sky-400" />
                            <span className="text-xs font-black text-sky-400 uppercase">System Active</span>
                        </div>
                    </div>
                </header>

                {/* OVERVIEW SECTION (KPIs) */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <KPICard
                        title="Total Forecast Mes"
                        value={totalForecast.toLocaleString()}
                        subtext="Unidades proyectadas al cierre"
                        icon={Target}
                        trend={monthlyVariation}
                    />
                    <KPICard
                        title="Accuracy Rate"
                        value={`${accuracyRate}%`}
                        subtext="Confidencialidad del motor AI"
                        icon={ShieldCheck}
                    />
                    <KPICard
                        title="Vs Mes Anterior"
                        value={`+${monthlyVariation}%`}
                        subtext="Incremento en tendencia de cierre"
                        icon={TrendingUp}
                    />
                </section>

                {/* MAIN CHART SECTION */}
                <section className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <BarChart3 size={400} />
                    </div>

                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Forecast Time Series</h3>
                            <p className="text-sm text-slate-500 font-medium">Histórico vs Proyección predictiva de ventas</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-500/40" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Histórico</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">IA Prediction</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[450px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip content={<CustomTooltip />} />

                                {/* Confidence Interval Area */}
                                <Area
                                    type="monotone"
                                    dataKey="high"
                                    stroke="none"
                                    fill={COLORS.confidence}
                                    connectNulls
                                />
                                <Area
                                    type="monotone"
                                    dataKey="low"
                                    stroke="none"
                                    fill={COLORS.background}
                                    connectNulls
                                />

                                {/* Historical Line */}
                                <Line
                                    type="monotone"
                                    dataKey="real"
                                    stroke="#64748b"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#64748b', strokeWidth: 2, stroke: '#020617' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    name="Real (Histórico)"
                                />

                                {/* Prediction Line */}
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#38bdf8"
                                    strokeWidth={4}
                                    strokeDasharray="8 8"
                                    dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#020617' }}
                                    activeDot={{ r: 8, strokeWidth: 4, stroke: 'rgba(56, 189, 248, 0.2)' }}
                                    name="Predicción IA"
                                />

                                {/* Today Marker */}
                                <ReferenceLine x="06 Mar" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* BOTTOM DETAIL SECTION */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Performance Radar</h4>
                        <div className="space-y-6">
                            {['MG Cuajimalpa', 'Acura Interlomas', 'KIA Iztapalapa'].map((agencia, i) => (
                                <div key={agencia} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
                                            0{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm tracking-tight">{agencia}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Forecast: {45 + (i * 12)} units</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-white">92%</p>
                                            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter">On Target</p>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-sky-600/20 to-indigo-600/20 border border-sky-500/20 p-8 rounded-[2rem] backdrop-blur-xl flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-sky-500/20">
                                <LayoutDashboard size={24} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 italic">Intelligence Report</h3>
                            <p className="text-sm text-sky-200/60 leading-relaxed font-medium">
                                El motor Antigravity detecta una aceleración inusual en el segmento de SUVs para el cierre de Marzo. Se recomienda ajustar inventario en la zona metropolitana.
                            </p>
                        </div>
                        <button className="w-full mt-10 bg-white text-black font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-sky-400 transition-colors shadow-2xl">
                            Descargar Reporte Ejecutivo
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}
