'use client'

import { useState, useMemo } from 'react'
import DashboardFilters from './DashboardFilters'

export default function DashboardClient({ initialStats, agencias, diaCorte }) {
    const [filter, setFilter] = useState({ type: 'all', value: 'Total' })

    const groups = {
        'MG': ['MG Cuajimalpa', 'MG Interlomas', 'MG Iztapalapa', 'MG Santa Fe'],
        'KIA': ['KIA Interlomas', 'KIA Iztapalapa'],
        'Honda': ['Honda Cuajimalpa', 'Honda Interlomas'],
        'GWM': ['GWM Cuernavaca', 'GWM Iztapalapa'],
        'Acura': ['Acura']
    }

    const filteredStats = useMemo(() => {
        if (filter.type === 'all') return initialStats
        if (filter.type === 'group') {
            const groupAgencies = groups[filter.value] || []
            return initialStats.filter(s => groupAgencies.includes(s.agencia))
        }
        if (filter.type === 'agency') {
            return initialStats.filter(s => s.agencia === filter.value)
        }
        return initialStats
    }, [filter, initialStats])

    const globalVentasNuevos = filteredStats.reduce((acc, s) => acc + s.ventasNuevosHoy, 0)
    const globalVentasSemis = filteredStats.reduce((acc, s) => acc + s.ventasSemisHoy, 0)
    const globalPronostico = filteredStats.reduce((acc, s) => acc + s.pronosticoTotal, 0)

    const globalFunnel = {
        digital: {
            leads: filteredStats.reduce((acc, s) => acc + s.funnel.digital.leads, 0),
            contactados: filteredStats.reduce((acc, s) => acc + s.funnel.digital.contactados, 0),
            citas: filteredStats.reduce((acc, s) => acc + s.funnel.digital.citasAgendadas, 0),
            efectivas: filteredStats.reduce((acc, s) => acc + s.funnel.digital.citasEfectivas, 0),
            ventas: filteredStats.reduce((acc, s) => acc + s.funnel.digital.ventas, 0)
        },
        showroom: {
            visitas: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.visitas, 0),
            pruebas: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.pruebas, 0),
            financiera: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.financiera, 0),
            aprobados: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.aprobados, 0),
            avaluos: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.avaluos, 0),
            ventas: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.ventas, 0)
        },
        predictors: {
            apartados: filteredStats.reduce((acc, s) => acc + (s.apartados || 0), 0),
            probables: filteredStats.reduce((acc, s) => acc + (s.probables || 0), 0),
        }
    }

    return (
        <main className="min-h-screen premium-bg text-slate-100 p-4 md:p-12 relative overflow-hidden">
            <div className="animated-bg" />

            {/* BARRA CORPORATIVA SUPERIOR */}
            <div className="relative z-20 mb-12 flex flex-col md:flex-row justify-between items-center bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
                <div className="flex flex-col mb-4 md:mb-0">
                    <h2 className="text-sm font-black tracking-[0.3em] uppercase opacity-40">Grupo Daytona • Predictor IA</h2>
                    <p className="text-2xl font-black text-white">CONSOLIDADO MARZO 6</p>
                </div>
                <div className="flex gap-12 text-center">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-1">Cierre Proyectado</p>
                        <p className="text-3xl font-black neon-text-cyan">{globalPronostico}</p>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-1">Reales (N+S)</p>
                        <p className="text-3xl font-black text-white">{globalVentasNuevos + globalVentasSemis}</p>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-1">Apartados</p>
                        <p className="text-3xl font-black text-emerald-400">{globalFunnel.predictors.apartados}</p>
                    </div>
                </div>
                <DashboardFilters
                    agencias={agencias}
                    currentFilter={filter}
                    onFilterChange={setFilter}
                />
            </div>

            <header className="relative z-10 mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter neon-text-cyan mb-4">
                        DAYTONA<span className="text-white/20">.</span>CORE
                    </h1>
                    <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                        Intelligence v2.2 Luxury
                    </span>
                </div>
            </header>

            {/* GRID DE AGENCIAS (LUJO) */}
            <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {filteredStats.map(s => (
                    <div key={s.agencia} className="glass-card p-10 flex flex-col justify-between card-hover-effect border-t-2 border-t-cyan-500/20">
                        <div>
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter mb-1 uppercase italic">{s.agencia}</h3>
                                    <div className="flex gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                        <span>REALE: <b className="text-white">{s.ventasNuevosHoy + s.ventasSemisHoy}</b></span>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${s.tendenciaPositiva ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.7)]' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]'}`} />
                            </div>

                            {/* INDICADORES DE SALUD (FUNNEL) */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-8 flex justify-around items-center">
                                <div className="text-center">
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">🌐 Leads</p>
                                    <p className="text-lg font-black text-cyan-400">{s.leads || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">📅 Citas</p>
                                    <p className="text-lg font-black text-white">{s.funnel.digital.citasEfectivas || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">💎 Apart.</p>
                                    <p className="text-lg font-black text-emerald-400">{s.apartados || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            {/* TERMÓMETRO DE CIERRE */}
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">Termómetro de Cierre</p>
                                <span className="thermometer-text">
                                    {s.pronostico20}
                                </span>
                                <p className="text-[10px] font-bold text-cyan-400/50 uppercase">Unidades Proyectadas</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-mono">P: {s.probables}</span>
                                <span className="text-[9px] font-mono">S: {s.pronosticoSemis}</span>
                                <span className="text-[9px] font-mono">IA: V2.2</span>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                <FunnelWidget
                    title="Digital Funnel"
                    icon="🌐"
                    color="cyan"
                    data={[
                        { label: 'Leads', value: globalFunnel.digital.leads },
                        { label: 'Contactados', value: globalFunnel.digital.contactados },
                        { label: 'Citas', value: globalFunnel.digital.citas },
                        { label: 'Efectivas', value: globalFunnel.digital.efectivas },
                        { label: 'Ventas', value: globalFunnel.digital.ventas }
                    ]}
                />

                <FunnelWidget
                    title="Showroom Funnel"
                    icon="🚗"
                    color="amber"
                    data={[
                        { label: 'Visitas', value: globalFunnel.showroom.visitas },
                        { label: 'Pruebas', value: globalFunnel.showroom.pruebas },
                        { label: 'Financiera', value: globalFunnel.showroom.financiera },
                        { label: 'Aprobados', value: globalFunnel.showroom.aprobados },
                        { label: 'Avalúos', value: globalFunnel.showroom.avaluos },
                        { label: 'Ventas', value: globalFunnel.showroom.ventas }
                    ]}
                />
            </section>
        </main>
    )
}

function KpiTile({ label, value, subtext, color, glow, neon }) {
    const textClass = color === 'cyan' ? (neon ? 'neon-text-cyan' : 'text-white') : 'text-white';
    const subtextClass = color === 'cyan' ? 'text-cyan-400/60' : 'text-amber-400/60';
    const glowClass = glow ? 'glow-cyan' : '';

    return (
        <div className={`glass-card p-8 ${glowClass} ${color === 'cyan' && !glow && !neon ? 'border-cyan-500/30' : ''} ${color === 'amber' ? 'bg-white/[0.05]' : ''}`}>
            <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4">{label}</p>
            <h2 className={`text-5xl font-black mb-1 ${textClass}`}>{value.toLocaleString()}</h2>
            <p className={`${subtextClass} text-xs font-medium italic`}>{subtext}</p>
        </div>
    )
}

function FunnelWidget({ title, icon, color, data }) {
    const colorClass = color === 'cyan' ? 'bg-cyan-500' : 'bg-amber-500';
    const textClass = color === 'cyan' ? 'text-cyan-400' : 'text-amber-400';
    const borderClass = color === 'cyan' ? 'border-cyan-500/10' : 'border-amber-500/10';

    return (
        <div className={`glass-card p-10 border ${borderClass}`}>
            <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                <span className={`w-8 h-8 rounded-lg ${colorClass}/20 flex items-center justify-center ${textClass} text-sm`}>{icon}</span>
                {title}
            </h3>
            <div className="space-y-6">
                {data.map((step, i) => {
                    const prevValue = data[i - 1]?.value || step.value;
                    const conversion = i === 0 ? 100 : (prevValue > 0 ? (step.value / prevValue) * 100 : 0);

                    return (
                        <div key={step.label} className="relative">
                            <div className="flex justify-between mb-2 px-1 items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{step.label}</span>
                                    <span className="text-2xl font-black">{step.value.toLocaleString()}</span>
                                </div>
                                {i > 0 && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${colorClass}/10 ${textClass}`}>
                                        {conversion.toFixed(1)}% conv.
                                    </span>
                                )}
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${colorClass} transition-all duration-1000 shadow-[0_0_15px_rgba(34,211,238,0.5)]`}
                                    style={{ width: `${data[0].value > 0 ? Math.max(5, (step.value / data[0].value) * 100) : 5}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
