import { supabase } from '@/lib/supabase'
import { calcularPronosticoDaytona } from '@/lib/forecast'

export const dynamic = 'force-dynamic'

async function getSalesData() {
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

    return { marchData, februaryData }
}

export default async function Dashboard() {
    const { marchData, februaryData } = await getSalesData()

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

        // Métricas de Funnel
        const leads = marchAgencia.reduce((acc, r) => acc + (r.leads || 0), 0)
        const contactados = marchAgencia.reduce((acc, r) => acc + (r.leads_contactados || 0), 0)
        const citasAgendadas = marchAgencia.reduce((acc, r) => acc + (r.citas_agendadas || 0), 0)
        const citasEfectivas = marchAgencia.reduce((acc, r) => acc + (r.citas_efectivas || 0), 0)

        const visitas = marchAgencia.reduce((acc, r) => acc + (r.visitas_piso || 0), 0)
        const pruebas = marchAgencia.reduce((acc, r) => acc + (r.pruebas_manejo || 0), 0)
        const financiera = marchAgencia.reduce((acc, r) => acc + (r.solicitudes_financiera || 0), 0)
        const avaluos = marchAgencia.reduce((acc, r) => acc + (r.avaluos || 0), 0)

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
            tendenciaPositiva: (pronosticoNuevos + pronosticoSemis) > cierreFebTotal,
            funnel: {
                digital: { leads, contactados, citasAgendadas, citasEfectivas, ventas: ventasNuevosHoy },
                showroom: { visitas, pruebas, financiera, avaluos, ventas: ventasNuevosHoy }
            }
        }
    })

    const globalVentasNuevos = stats.reduce((acc, s) => acc + s.ventasNuevosHoy, 0)
    const globalVentasSemis = stats.reduce((acc, s) => acc + s.ventasSemisHoy, 0)
    const globalPronostico = stats.reduce((acc, s) => acc + s.pronosticoTotal, 0)

    // Totales de Funnel Global
    const globalFunnel = {
        digital: {
            leads: stats.reduce((acc, s) => acc + s.funnel.digital.leads, 0),
            contactados: stats.reduce((acc, s) => acc + s.funnel.digital.contactados, 0),
            citas: stats.reduce((acc, s) => acc + s.funnel.digital.citasAgendadas, 0),
            efectivas: stats.reduce((acc, s) => acc + s.funnel.digital.citasEfectivas, 0),
            ventas: stats.reduce((acc, s) => acc + s.funnel.digital.ventas, 0)
        },
        showroom: {
            visitas: stats.reduce((acc, s) => acc + s.funnel.showroom.visitas, 0),
            pruebas: stats.reduce((acc, s) => acc + s.funnel.showroom.pruebas, 0),
            financiera: stats.reduce((acc, s) => acc + s.funnel.showroom.financiera, 0),
            avaluos: stats.reduce((acc, s) => acc + s.funnel.showroom.avaluos, 0),
            ventas: stats.reduce((acc, s) => acc + s.funnel.showroom.ventas, 0)
        }
    }

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

            {/* Funnel Real Data */}
            <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pb-32">
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
