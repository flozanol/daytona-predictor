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

    // Cálculos Globales para la Tríada Superior
    const totalVentasGrupo = globalVentasNuevos + globalVentasSemis
    const totalPronostico = globalPronostico
    // Asumimos un objetivo global (ej: Feb + 10%) para el cumplimiento
    const globalObjetivo = 350 // Fallback estimado si no hay datos históricos suficientes
    const cumplimientoGlobal = Math.round((totalPronostico / globalObjetivo) * 100)

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-12 relative overflow-hidden selection:bg-cyan-500/30">
            <div className="animated-bg" />

            {/* HEADER EJECUTIVO CORPORATIVO */}
            <header className="relative z-20 mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-1 bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        <span className="text-xs font-black tracking-[0.5em] uppercase text-cyan-500/80">Daytona Core • Predictive AI</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                        GRUPO <span className="text-white/20">DAYTONA</span>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px] mt-2">Dashboard Ejecutivo • Marzo 2026 • Día {diaCorte}</p>
                </div>

                <div className="flex items-center gap-6">
                    <DashboardFilters
                        agencias={agencias}
                        currentFilter={filter}
                        onFilterChange={setFilter}
                    />
                </div>
            </header>

            {/* TRÍADA DE KPIs GIGANTES */}
            <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <ExecutiveKpi
                    label="Ventas Reales Grupo"
                    value={totalVentasGrupo}
                    subtext="Unidades (Nuevos + Semis)"
                    icon="📊"
                />
                <ExecutiveKpi
                    label="Pronóstico Total Marzo"
                    value={totalPronostico}
                    subtext="Proyección Predictiva IA"
                    color="cyan"
                    glow
                />
                <ExecutiveKpi
                    label="Cumplimiento Global"
                    value={`${cumplimientoGlobal}%`}
                    subtext="vs Objetivo Corporativo"
                    icon="🎯"
                />
            </section>

            {/* GRID DE AGENCIAS EJECUTIVAS */}
            <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
                {filteredStats.map(s => {
                    // Lógica de Ritmo/Salud (Status)
                    // Objetivo dinámico basado en febrero o promedio
                    const objetivoAgencia = 30 // Fallback
                    const ritmoNecesario = (diaCorte / 31) * objetivoAgencia
                    const ventasAgencia = s.ventasNuevosHoy + s.ventasSemisHoy
                    const isHealthy = ventasAgencia >= (ritmoNecesario * 0.8)
                    const statusClass = isHealthy ? 'border-emerald-500/30' : 'border-rose-500/30'
                    const statusText = isHealthy ? 'En Ritmo' : 'Bajo Meta'
                    const statusColor = isHealthy ? 'text-emerald-400' : 'text-rose-400'

                    return (
                        <div key={s.agencia} className={`executive-glass-card border-l-4 ${statusClass} flex flex-col justify-between group`}>
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-cyan-400 transition-colors uppercase">{s.agencia}</h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${statusColor} mt-1`}>{statusText}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Reales</p>
                                        <p className="text-xl font-black">{ventasAgencia}</p>
                                    </div>
                                </div>

                                {/* FUNNEL CHIPS */}
                                <div className="flex flex-wrap gap-2 mb-10">
                                    <FunnelChip icon="🌐" label="Leads" value={s.leads || 0} />
                                    <FunnelChip icon="📅" label="Citas" value={s.funnel.digital.citasEfectivas || 0} />
                                    <FunnelChip icon="💎" label="Apartados" value={s.apartados || 0} />
                                    <FunnelChip icon="🚗" label="Ventas" value={ventasAgencia} />
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <p className="text-[11px] font-black tracking-[0.3em] text-slate-500 uppercase mb-2">Reloj de Cierre</p>
                                <div className="relative">
                                    <span className="closing-clock neon-glow-cyan">
                                        {s.pronostico20}
                                    </span>
                                    {/* Sutil indicador de progreso interno si quisiéramos */}
                                </div>
                                <div className="flex gap-4 mt-4 text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
                                    <span>Probables: {s.probables}</span>
                                    <span>Semis: {s.pronosticoSemis}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </section>
        </main>
    )
}

function ExecutiveKpi({ label, value, subtext, icon, color, glow }) {
    const valueClass = color === 'cyan' ? 'text-cyan-400 neon-glow-cyan' : 'text-white'
    const glowClass = glow ? 'shadow-[0_0_50px_-20px_rgba(34,211,238,0.3)]' : ''

    return (
        <div className={`executive-glass-card ${glowClass} border-t border-white/5`}>
            <div className="flex justify-between items-start mb-6">
                <p className="text-slate-500 text-[11px] font-black tracking-[0.2em] uppercase">{label}</p>
                {icon && <span className="text-xl opacity-50">{icon}</span>}
            </div>
            <h2 className={`text-6xl font-black mb-2 tracking-tighter ${valueClass}`}>{value}</h2>
            <p className="text-slate-400 text-xs font-medium italic opacity-60">{subtext}</p>
        </div>
    )
}

function FunnelChip({ icon, label, value }) {
    return (
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full">
            <span className="text-xs">{icon}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}:</span>
            <span className="text-[11px] font-bold text-white">{value}</span>
        </div>
    )
}
