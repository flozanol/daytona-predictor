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
            avaluos: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.avaluos, 0),
            ventas: filteredStats.reduce((acc, s) => acc + s.funnel.showroom.ventas, 0)
        }
    }

    return (
        <main className="min-h-screen premium-bg text-slate-100 p-4 md:p-12 relative overflow-hidden">
            <div className="animated-bg" />

            <header className="relative z-10 mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter neon-text-cyan mb-4">
                        DAYTONA<span className="text-white/20">.</span>CORE
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                            Intelligence v2.0
                        </span>
                        <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                            MARZO 2026 • DÍA {diaCorte}
                        </span>
                    </div>
                </div>

                <DashboardFilters
                    agencias={agencias}
                    currentFilter={filter}
                    onFilterChange={setFilter}
                />
            </header>

            <section className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <KpiTile label="Unidades Nuevas" value={globalVentasNuevos} subtext="Ventas Reales" color="cyan" glow />
                <KpiTile label="Unidades Seminuevos" value={globalVentasSemis} subtext="En crecimiento" color="amber" />
                <KpiTile label="Pronóstico AI (Total)" value={globalPronostico} subtext="Proyección Fin de Mes" color="cyan" neon />
                <div className="glass-card p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4" />
                    <p className="text-[10px] font-black tracking-widest uppercase">Live Engine</p>
                </div>
            </section>

            <section className="relative z-10 glass-card overflow-hidden mb-16">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <h3 className="text-xl font-bold tracking-tight">Ranking de Operación</h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{filteredStats.length} Agencias Listadas</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left bg-white/[0.01]">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Agencia</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Ventas (N/S)</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Forecast Nuevos</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Forecast Semis</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Total IA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStats.map(s => (
                                <tr key={s.agencia} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${s.tendenciaPositiva ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                                            <span className="text-lg font-bold tracking-tight">{s.agencia}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2 font-mono text-sm">
                                            <span className="text-white">{s.ventasNuevosHoy}</span>
                                            <span className="text-slate-600">/</span>
                                            <span className="text-slate-400">{s.ventasSemisHoy}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-cyan-400 font-black">{s.pronosticoNuevos}</td>
                                    <td className="px-8 py-6 text-amber-400/80 font-bold">{s.pronosticoSemis}</td>
                                    <td className="px-8 py-6">
                                        <span className="text-2xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
                                            {s.pronosticoTotal}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
