'use client'

import { useState, useMemo } from 'react'
import DashboardFilters from './DashboardFilters'

export default function DashboardClient({ initialStats, agencias, diaCorte, globalFebBaselines }) {
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

    // Agregados para el dashboard actual
    const currentVentasNuevos = filteredStats.reduce((acc, s) => acc + s.ventasNuevosHoy, 0)
    const currentVentasSemis = filteredStats.reduce((acc, s) => acc + s.ventasSemisHoy, 0)
    const currentVisitas = filteredStats.reduce((acc, s) => acc + s.funnel.showroom.visitas, 0)
    const currentLeads = filteredStats.reduce((acc, s) => acc + s.funnel.digital.leads, 0)
    const currentPronostico = filteredStats.reduce((acc, s) => acc + s.pronosticoTotal, 0)

    // Comparativos (Si estamos en 'Total', usamos globalFebBaselines; si no, calculamos de filteredStats)
    const baselineNuevos = filter.type === 'all' ? globalFebBaselines.nuevos : filteredStats.reduce((acc, s) => acc + s.febNuevos, 0)
    const baselineSemis = filter.type === 'all' ? globalFebBaselines.semis : filteredStats.reduce((acc, s) => acc + s.febSemis, 0)

    const diffNuevos = currentVentasNuevos - baselineNuevos
    const diffSemis = currentVentasSemis - baselineSemis

    return (
        <main className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-10 relative selection:bg-rose-500/30">
            <div className="animated-bg" />

            {/* HEADER CORPORATIVO */}
            <header className="relative z-20 mb-10 flex flex-col md:flex-row justify-between items-center bg-slate-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.5)]">
                        <span className="text-white font-black text-xl">D</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white">DAYTONA<span className="text-rose-500">.</span>PREDICTOR</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Unit v5.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estado del Grupo</p>
                        <p className="text-sm font-black text-white capitalize">{filter.value || 'Total Grupo'}</p>
                    </div>
                    <DashboardFilters
                        agencias={agencias}
                        currentFilter={filter}
                        onFilterChange={setFilter}
                    />
                </div>
            </header>

            {/* TOP ROW: SUMMARY CARDS */}
            <section className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <SummaryCard
                    label="Ventas Nuevos"
                    value={currentVentasNuevos}
                    comparison={baselineNuevos}
                    diff={diffNuevos}
                    color="rose"
                />
                <SummaryCard
                    label="Ventas Seminuevos"
                    value={currentVentasSemis}
                    comparison={baselineSemis}
                    diff={diffSemis}
                    color="slate"
                />
                <SummaryCard
                    label="Visitas a Piso"
                    value={currentVisitas}
                    icon="👥"
                    color="slate"
                />
                <SummaryCard
                    label="Leads Totales"
                    value={currentLeads}
                    icon="📈"
                    color="slate"
                />
            </section>

            {/* FUNNELS SECTION */}
            <section className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                <div className="bento-card relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Digital CRM Efficiency</h3>
                        <span className="text-2xl font-black text-rose-500">{((currentVentasNuevos / (currentLeads || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="space-y-6">
                        <FunnelBar label="Leads Recibidos" value={currentLeads} total={currentLeads} color="slate" />
                        <FunnelBar label="Citas Agendadas" value={filteredStats.reduce((acc, s) => acc + s.funnel.digital.citasAgendadas, 0)} total={currentLeads} color="rose" />
                        <FunnelBar label="Ventas Digitales" value={currentVentasNuevos} total={currentLeads} color="rose" glow />
                    </div>
                </div>

                <div className="bento-card">
                    <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-8">Showroom Flow</h3>
                    <div className="flex flex-col gap-4">
                        <FlowStep icon="🚗" label="Visitas" value={currentVisitas} />
                        <div className="h-4 w-px bg-white/10 ml-5" />
                        <FlowStep icon="⏱️" label="Pruebas" value={filteredStats.reduce((acc, s) => acc + s.funnel.showroom.pruebas, 0)} />
                        <div className="h-4 w-px bg-white/10 ml-5" />
                        <FlowStep icon="💎" label="Apartados" value={filteredStats.reduce((acc, s) => acc + (s.apartados || 0), 0)} highlight />
                    </div>
                </div>
            </section>

            {/* BENTO AGENCY GRID */}
            <div className="relative z-10 mb-6">
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-slate-500 mb-8 px-2">Health Radar • 11 Agencias</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {filteredStats.map(s => (
                        <div key={s.agencia} className="bento-card border-t-2 border-t-rose-500/20 flex flex-col justify-between hover:scale-[1.03]">
                            <div>
                                <h4 className="text-sm font-black text-white truncate mb-4 italic uppercase">{s.agencia}</h4>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className={`w-1.5 h-1.5 rounded-full ${s.tendenciaPositiva ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]'}`} />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        {s.tendenciaPositiva ? 'On Target' : 'Pace Alert'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Forecast</p>
                                    <p className="text-2xl font-black text-white leading-none">{s.pronostico20}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Real</p>
                                    <p className="text-lg font-bold text-slate-400 leading-none">{s.ventasNuevosHoy + s.ventasSemisHoy}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}

function SummaryCard({ label, value, comparison, diff, icon, color }) {
    const isPositive = diff >= 0
    const colorClass = color === 'rose' ? 'text-rose-500' : 'text-white'

    return (
        <div className="bento-card">
            <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase mb-4">{label}</p>
            <div className="flex justify-between items-end">
                <div>
                    <h2 className={`text-4xl font-black tracking-tighter ${colorClass} leading-none mb-2`}>
                        {value.toLocaleString()}
                        {icon && <span className="ml-2 text-xl opacity-30">{icon}</span>}
                    </h2>
                    {comparison !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isPositive ? '+' : ''}{diff} pts
                            </span>
                            <span className="text-slate-600 text-[9px] font-medium uppercase tracking-tighter">vs Feb</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function FunnelBar({ label, value, total, color, glow }) {
    const percentage = (value / (total || 1)) * 100
    const barColor = color === 'rose' ? 'bg-rose-600' : 'bg-slate-700'
    const glowClass = glow ? 'shadow-[0_0_15px_rgba(225,29,72,0.6)]' : ''

    return (
        <div className="group">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                <span>{label}</span>
                <span>{value.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                    className={`h-full ${barColor} ${glowClass} rounded-full transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function FlowStep({ icon, label, value, highlight }) {
    return (
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${highlight ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-slate-800 text-slate-400'}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                    <p className={`text-xl font-black ${highlight ? 'text-white' : 'text-slate-300'}`}>{value.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}
