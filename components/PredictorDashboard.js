'use client'

import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, ReferenceLine
} from 'recharts';
import {
    TrendingUp,
    Target,
    Zap,
    ShieldCheck,
    ChevronRight,
    ArrowUpRight,
    Sparkles,
    Info
} from 'lucide-react';

const DESIGN_TOKENS = {
    bg: '#030712',
    cardBg: 'rgba(255, 255, 255, 0.02)',
    cardBorder: 'rgba(255, 255, 255, 0.06)',
    accent: '#38bdf8', // Electric Blue
    emerald: '#10b981', // Emerald Neon
    historical: '#475569',
    prediction: '#38bdf8',
    textMain: '#f8fafc',
    textSecondary: '#64748b'
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const real = payload.find(p => p.dataKey === 'real')?.value;
        const forecast = payload.find(p => p.dataKey === 'predicted')?.value;
        const diff = (real && forecast) ? real - forecast : null;

        return (
            <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">{label}</p>
                <div className="space-y-3">
                    {real !== undefined && (
                        <div className="flex items-center justify-between gap-10">
                            <span className="text-slate-400 text-xs font-medium">Real</span>
                            <span className="text-white text-sm font-black">{real}</span>
                        </div>
                    )}
                    {forecast !== undefined && (
                        <div className="flex items-center justify-between gap-10">
                            <span className="text-sky-400 text-xs font-medium">Forecast</span>
                            <span className="text-white text-sm font-black">{forecast}</span>
                        </div>
                    )}
                    {diff !== null && (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-slate-500 text-[10px] font-bold uppercase">Diferencia</span>
                            <span className={`text-xs font-black ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {diff > 0 ? '+' : ''}{diff}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const MetricCard = ({ title, value, subtext, icon: Icon, type = 'default', progress }) => (
    <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-[2rem] flex flex-col justify-between transition-all hover:bg-white/[0.04] hover:border-white/10 group">
        <div>
            <div className="flex items-center justify-between mb-6">
                <span className="text-[#64748b] text-[10px] font-bold uppercase tracking-[0.2em]">{title}</span>
                <div className="bg-white/[0.03] p-2 rounded-xl text-slate-500 group-hover:text-white transition-colors">
                    <Icon size={16} />
                </div>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-2 italic">
                {value}
            </h2>
            <p className="text-[#64748b] text-xs font-medium tracking-wide">
                {subtext}
            </p>
        </div>

        {progress !== undefined && (
            <div className="mt-8">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-sky-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Gap vs Objetivo</span>
                    <span className="text-[10px] font-bold text-sky-400 uppercase">{progress}% Complete</span>
                </div>
            </div>
        )}
    </div>
);

export default function PredictorDashboard({ initialStats }) {
    // Mock trend data
    const data = [
        { name: 'Feb 15', real: 850, predicted: 850, low: 840, high: 860 },
        { name: 'Feb 20', real: 890, predicted: 890, low: 880, high: 900 },
        { name: 'Feb 25', real: 940, predicted: 940, low: 920, high: 960 },
        { name: 'Mar 01', real: 980, predicted: 980, low: 960, high: 1000 },
        { name: 'Mar 06', real: 1020, predicted: 1020, low: 1000, high: 1040 },
        { name: 'Mar 10', real: null, predicted: 1080, low: 1040, high: 1120 },
        { name: 'Mar 15', real: null, predicted: 1150, low: 1100, high: 1200 },
        { name: 'Mar 20', real: null, predicted: 1240, low: 1180, high: 1300 },
        { name: 'Mar 25', real: null, predicted: 1320, low: 1250, high: 1390 },
        { name: 'Mar 31', real: null, predicted: 1450, low: 1350, high: 1550 },
    ];

    return (
        <div className="min-h-screen bg-[#030712] text-[#f8fafc] font-sans p-6 md:p-12 overflow-x-hidden">
            {/* Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-500/5 blur-[160px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[160px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <header className="flex justify-between items-end mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                            <span className="text-sky-400 text-xs font-black uppercase tracking-[0.4em]">Intelligence Unit</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic">
                            DAYTONA PREDICTOR
                        </h1>
                        <p className="text-[#64748b] font-medium tracking-wide">
                            Análisis Predictivo de Ventas • <span className="text-sky-500/60 uppercase text-[10px] font-black">Powered by Antigravity AI</span>
                        </p>
                    </div>
                    <div className="flex gap-4 mb-2">
                        <button className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 transition-colors">
                            Exportar
                        </button>
                    </div>
                </header>

                {/* TOP ROW: METRIC CARDS */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <MetricCard
                        title="Ventas Proyectadas"
                        value="1,450"
                        subtext="Unidades estimadas al cierre de Marzo"
                        icon={TrendingUp}
                    />
                    <MetricCard
                        title="Precisión del Modelo"
                        value="98.2%"
                        subtext="Nivel de confianza histórico de la IA"
                        icon={ShieldCheck}
                    />
                    <MetricCard
                        title="Estado del Objetivo"
                        value="84%"
                        subtext="Cumplimiento actual vs. Meta mensual"
                        icon={Target}
                        progress={84}
                    />
                </section>

                {/* MIDDLE ROW: CHART + GROWTH */}
                <section className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-16">
                    {/* Legend and Chart */}
                    <div className="lg:col-span-7 bg-white/[0.02] border border-white/[0.06] p-10 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-wider">Forecast Hero</h3>
                                <p className="text-xs text-[#64748b] font-medium uppercase tracking-widest">Historical vs. AI Prediction (Neon Mode)</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">IA Glow</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                                        dy={15}
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
                                        fill="rgba(56, 189, 248, 0.05)"
                                        connectNulls
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="low"
                                        stroke="none"
                                        fill="#030712"
                                        connectNulls
                                    />

                                    {/* Historical Line */}
                                    <Line
                                        type="monotone"
                                        dataKey="real"
                                        stroke="#475569"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: '#475569', strokeWidth: 2, stroke: '#030712' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />

                                    {/* Prediction Line with Neon Glow */}
                                    <Line
                                        type="monotone"
                                        dataKey="predicted"
                                        stroke="#38bdf8"
                                        strokeWidth={4}
                                        strokeDasharray="10 10"
                                        dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#030712' }}
                                        activeDot={{ r: 8, stroke: 'rgba(56, 189, 248, 0.3)', strokeWidth: 10 }}
                                    />

                                    {/* Reference Line for Today */}
                                    <ReferenceLine x="Mar 06" stroke="rgba(255,255,255,0.08)" strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top 3 Models */}
                    <div className="lg:col-span-3 bg-white/[0.02] border border-white/[0.06] p-10 rounded-[2.5rem]">
                        <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] mb-10">Top Growth Models</h4>
                        <div className="space-y-8">
                            {[
                                { name: 'MG ZS', growth: '+24%', color: 'sky' },
                                { name: 'KIA Sportage', growth: '+18%', color: 'sky' },
                                { name: 'Honda CR-V', growth: '+12%', color: 'slate' }
                            ].map((model, i) => (
                                <div key={model.name} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${model.color === 'sky' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                                            0{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white italic">{model.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Trend: Upward</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-emerald-400">{model.growth}</span>
                                        <ArrowUpRight size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 pt-10 border-t border-white/5">
                            <div className="flex items-start gap-4 p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10">
                                <Info size={16} className="text-sky-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-sky-200/60 leading-relaxed font-bold uppercase tracking-wider">
                                    Modelos con mayor probabilidad de quiebre de stock según flujo CRM.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BOTTOM ROW: AI INSIGHTS */}
                <section className="bg-gradient-to-r from-sky-400/5 via-indigo-400/5 to-purple-400/5 border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[100%] bg-sky-500/10 blur-[100px] skew-x-12" />
                    </div>

                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] shrink-0 z-10 transition-transform hover:scale-110">
                        <Sparkles size={28} className="text-slate-900 fill-slate-900" />
                    </div>

                    <div className="z-10 text-center md:text-left">
                        <h4 className="text-xs font-black text-sky-400 uppercase tracking-[0.3em] mb-3">Antigravity AI Insights</h4>
                        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed tracking-tight italic">
                            "Antigravity detecta <span className="text-sky-400">tendencia al alza</span> en SUVs para el Q4; se recomienda aumentar inventario ante la aceleración del 12.5% vs. periodo previo."
                        </p>
                    </div>

                    <div className="md:ml-auto z-10">
                        <button className="flex items-center gap-3 text-xs font-black py-4 px-8 bg-sky-500 rounded-2xl text-white uppercase tracking-widest hover:bg-sky-400 transition-all shadow-[0_10px_30px_rgba(56,189,248,0.3)]">
                            Ajustar Inventario
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}
