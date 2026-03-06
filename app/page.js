import { supabase } from '@/lib/supabase'
import AgencyTableRow from '@/components/AgencyTableRow'
import KpiCard from '@/components/KpiCard'
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
        const ventasSeminuevosHoy = marchAgencia.reduce((acc, r) => acc + (r.ventas_seminuevos || 0), 0)
        const actualesTotal = ventasNuevosHoy + ventasSeminuevosHoy

        const cierreFebTotal = febAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0) + (r.ventas_seminuevos || 0), 0)

        // Aplicamos la lógica oficial de pronóstico por separado o conjunta
        const pronosticoNuevos = calcularPronosticoDaytona(ventasNuevosHoy, diaCorte, agencia)
        const pronosticoSemis = calcularPronosticoDaytona(ventasSeminuevosHoy, diaCorte, agencia)
        const pronosticoTotal = pronosticoNuevos + pronosticoSemis

        const sube = pronosticoTotal > cierreFebTotal
        const meta = Math.round(cierreFebTotal * 1.2) || 10

        return {
            agencia,
            actuales: actualesTotal,
            ventasNuevosHoy,
            pronostico: pronosticoTotal,
            meta,
            sube
        }
    })

    const globalVentasNuevos = stats.reduce((acc, s) => acc + s.ventasNuevosHoy, 0)
    const globalPronostico = stats.reduce((acc, s) => acc + s.pronostico, 0)

    return (
        <main className="min-h-screen p-8 bg-[#050b18] text-white font-sans">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-[#D4AF37]/20 pb-8">
                <div>
                    <h1 className="text-5xl font-extrabold gold-text mb-2 tracking-tighter">Daytona Predictor</h1>
                    <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                        Inteligencia de Ventas • Corte Marzo {diaCorte}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-[10px] text-slate-500 uppercase tracking-widest">
                    Mes: Marzo 2026 • Motor IA: Daytona V1
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <KpiCard
                    label="Ventas Nuevos Hoy"
                    value={globalVentasNuevos}
                    subtext="Acumulado histórico al día 6"
                />
                <KpiCard
                    label="Pronóstico de Cierre"
                    value={globalPronostico}
                    subtext="Proyección final de mes estimada"
                />
                <KpiCard
                    label="Confianza del Modelo"
                    value="85%"
                    confidence={85}
                />
            </section>

            <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-3xl shadow-2xl">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.03]">
                            <th className="premium-table-header">Agencia</th>
                            <th className="premium-table-header">Ventas Actuales</th>
                            <th className="premium-table-header">Pronóstico Cierre (IA)</th>
                            <th className="premium-table-header">Meta Mes</th>
                            <th className="premium-table-header">Status & Progreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(stat => (
                            <AgencyTableRow key={stat.agencia} {...stat} />
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}
