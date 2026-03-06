import { supabase } from '@/lib/supabase'
import AgencyTableRow from '@/components/AgencyTableRow'
import KpiCard from '@/components/KpiCard'
import { calcularPronosticoDaytona } from '@/lib/forecast'

export const dynamic = 'force-dynamic'

async function getSalesData() {
    // Fetch labels for debugging funnels
    let labels = [];
    try {
        const { getSheetLabels } = await import('@/lib/import-logic');
        labels = await getSheetLabels('MG Cuajimalpa');
    } catch (e) {
        console.error('Error fetching labels:', e);
    }

    const { data: marchData } = await supabase
        .from('registros_agencias')
        .select('*')
        .gte('fecha', '2026-03-01')
        .lte('fecha', '2026-03-31')

    const { data: februaryData } = await supabase
        .from('registros_agencias')
        .select('*')
        .gte('fecha', '2026-02-01')
        .lte('fecha', '2026-02-28')

    return { marchData, februaryData, labels }
}

export default async function Dashboard() {
    const { marchData, februaryData, labels } = await getSalesData()

    const agencias = [
        'Acura', 'GWM Cuernavaca', 'GWM Iztapalapa',
        'Honda Cuajimalpa', 'Honda Interlomas',
        'KIA Interlomas', 'KIA Iztapalapa',
        'MG Cuajimalpa', 'MG Interlomas', 'MG Iztapalapa', 'MG Santa Fe'
    ]

    const diaCorte = 6 // Corte al 6 de marzo

    const stats = agencias.map(agencia => {
        const marchAgencia = marchData?.filter(r => r.agencia === agencia) || []
        const febAgencia = februaryData?.filter(r => r.agencia === agencia) || []

        const ventasNuevosHoy = marchAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0), 0)
        const ventasSemisHoy = marchAgencia.reduce((acc, r) => acc + (r.ventas_seminuevos || 0), 0)

        const pronosticoNuevos = calcularPronosticoDaytona(ventasNuevosHoy, diaCorte, agencia)
        const pronosticoSemis = calcularPronosticoDaytona(ventasSemisHoy, diaCorte, agencia)

        const cierreFebTotal = febAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0) + (r.ventas_seminuevos || 0), 0)

        return {
            agencia,
            ventasNuevosHoy,
            ventasSemisHoy,
            pronosticoNuevos,
            pronosticoSemis,
            pronosticoTotal: pronosticoNuevos + pronosticoSemis,
            tendenciaPositiva: (pronosticoNuevos + pronosticoSemis) > cierreFebTotal
        }
    })

    const globalVentasNuevos = stats.reduce((acc, s) => acc + s.ventasNuevosHoy, 0)
    const globalVentasSemis = stats.reduce((acc, s) => acc + s.ventasSemisHoy, 0)
    const globalPronostico = stats.reduce((acc, s) => acc + s.pronosticoTotal, 0)

    return (
        <main className="min-h-screen premium-bg text-slate-100 p-4 md:p-12 relative overflow-hidden">
            <div className="animated-bg" />

            {/* Header Premium */}
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

                {/* Global Filters Concept */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <button className="px-6 py-2 bg-cyan-500 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20">Grupo Daytona</button>
                    <button className="px-6 py-2 text-slate-400 text-xs font-bold hover:text-white transition-colors">Seleccionar Agencia</button>
                </div>
            </header>

            {/* Main KPIs */}
            <section className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <div className="glass-card p-8 glow-cyan">
                    <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4">Unidades Nuevas</p>
                    <h2 className="text-5xl font-black mb-1">{globalVentasNuevos}</h2>
                    <p className="text-cyan-400/60 text-xs font-medium">Ventas Reales</p>
                </div>
                <div className="glass-card p-8 bg-white/[0.05]">
                    <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4">Unidades Seminuevos</p>
                    <h2 className="text-5xl font-black mb-1">{globalVentasSemis}</h2>
                    <p className="text-amber-400/60 text-xs font-medium italic">En crecimiento</p>
                </div>
                <div className="glass-card p-8 border-cyan-500/30">
                    <p className="text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4">Pronóstico AI (Total)</p>
                    <h2 className="text-5xl font-black neon-text-cyan mb-1">{globalPronostico}</h2>
                    <p className="text-slate-500 text-xs font-medium">Proyección Fin de Mes</p>
                </div>
                <div className="glass-card p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4" />
                    <p className="text-[10px] font-black tracking-widest uppercase">Live Engine</p>
                </div>
            </section>

            {/* Main Table */}
            <section className="relative z-10 glass-card overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <h3 className="text-xl font-bold tracking-tight">Ranking de Operación</h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">11 Agencias Activas</span>
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
                            {stats.map(s => (
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

            {/* Funnel Placeholder / Mockup */}
            <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pb-32">
                <div className="glass-card p-10 border-cyan-500/10">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">🌐</span>
                        Digital Funnel
                    </h3>
                    <div className="space-y-6 opacity-40">
                        {['Leads', 'Contactados', 'Citas', 'Efectivas', 'Ventas'].map((step, i) => (
                            <div key={step} className="relative">
                                <div className="flex justify-between mb-2 px-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{step}</span>
                                    <span className="text-xs font-mono">--</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500/50" style={{ width: `${100 - i * 15}%` }} />
                                </div>
                            </div>
                        ))}
                        <p className="text-[10px] text-center italic text-slate-500 pt-4">Descubriendo filas en Google Sheets...</p>
                    </div>
                </div>

                <div className="glass-card p-10 border-amber-500/10">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm">🚗</span>
                        Showroom Funnel
                    </h3>
                    <div className="space-y-6 opacity-40">
                        {['Visitas', 'Pruebas', 'Financiera', 'Avalúos', 'Ventas'].map((step, i) => (
                            <div key={step} className="relative">
                                <div className="flex justify-between mb-2 px-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{step}</span>
                                    <span className="text-xs font-mono">--</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500/50" style={{ width: `${100 - i * 15}%` }} />
                                </div>
                            </div>
                        ))}
                        <p className="text-[10px] text-center italic text-slate-500 pt-4">Esperando mapeo de datos...</p>
                    </div>
                </div>
            </section>

            {/* Metadata Explorer (Temporary for V2 mapping) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transform translate-y-[85%] hover:translate-y-0 transition-transform duration-500">
                <div className="max-w-4xl mx-auto glass-card border-none rounded-t-[2rem] bg-cyan-950/80 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-black tracking-[0.3em] uppercase text-cyan-400">Metadata Explorer (Mapas de Google Sheet)</h4>
                        <span className="text-[8px] px-2 py-1 bg-white/10 rounded">Buscando Funnel en "MG Cuajimalpa"</span>
                    </div>
                    <div className="h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono scrollbar-hide">
                        {labels?.map(l => (
                            <div key={l.row} className="p-2 bg-black/20 rounded border border-white/5 hover:border-cyan-500/30 transition-colors">
                                <span className="text-cyan-500 mr-2">{l.row}:</span>
                                <span className="text-slate-300">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
