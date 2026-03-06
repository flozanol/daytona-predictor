import { supabase } from '@/lib/supabase'
import AgencyTableRow from '@/components/AgencyTableRow'

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

    const allAgencies = [
        ...(marchData?.map(r => r.agencia) || []),
        ...(februaryData?.map(r => r.agencia) || [])
    ]
    const agencias = [...new Set(allAgencies)].sort()

    const today = 6
    const daysInMonth = 31
    const factorCierreIA = 1.15

    const stats = agencias.map(agencia => {
        const marchAgencia = marchData?.filter(r => r.agencia === agencia) || []
        const febAgencia = februaryData?.filter(r => r.agencia === agencia) || []

        const actuales = marchAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0) + (r.ventas_seminuevos || 0), 0)
        const cierreFeb = febAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0) + (r.ventas_seminuevos || 0), 0)

        const pronostico = actuales > 0 ? (actuales / today) * daysInMonth * factorCierreIA : 0
        const sube = pronostico > cierreFeb

        // Meta Mes: Derivada como un objetivo superior al cierre de febrero
        const meta = Math.round(cierreFeb * 1.2) || 10

        return {
            agencia,
            actuales,
            pronostico: Math.round(pronostico),
            meta,
            sube
        }
    })

    return (
        <main className="min-h-screen p-8 bg-[#050b18] text-white font-sans">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-[#D4AF37]/20 pb-8">
                <div>
                    <h1 className="text-5xl font-extrabold gold-text mb-2 tracking-tighter">Daytona Predictor</h1>
                    <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                        Inteligencia de Ventas • Corte Marzo {today}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-[10px] text-slate-500 uppercase tracking-widest">
                    Mes: Marzo 2026 • Factor IA: 1.15x
                </div>
            </header>

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
