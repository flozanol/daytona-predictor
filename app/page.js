import { supabase } from '@/lib/supabase'
import VelocityCard from '@/components/VelocityCard'

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

    // Extraer lista única de agencias que tienen registros en Marzo o Febrero
    const allAgencies = [
        ...(marchData?.map(r => r.agencia) || []),
        ...(februaryData?.map(r => r.agencia) || [])
    ]
    const agencias = [...new Set(allAgencies)].sort()

    const today = 6 // Corte al 6 de marzo
    const daysInMonth = 31
    const factorCierreIA = 1.15 // 15% extra por ser la última semana más fuerte

    const stats = agencias.map(agencia => {
        const marchAgencia = marchData?.filter(r => r.agencia === agencia) || []
        const febAgencia = februaryData?.filter(r => r.agencia === agencia) || []

        const actuales = marchAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0) + (r.ventas_seminuevos || 0), 0)
        const cierreFeb = febAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0) + (r.ventas_seminuevos || 0), 0)

        // Pronóstico IA = (Actuales / hoy) * días_mes * 1.15
        const pronostico = actuales > 0 ? (actuales / today) * daysInMonth * factorCierreIA : 0
        const sube = pronostico > cierreFeb

        return {
            agencia,
            actuales,
            pronostico: Math.round(pronostico),
            cierreFeb,
            sube
        }
    })

    return (
        <main className="min-h-screen p-8 bg-[#050b18] text-white">
            <header className="mb-12 border-b border-[#D4AF37]/20 pb-6">
                <h1 className="text-4xl font-bold gold-text mb-2 tracking-tight">Daytona Predictor</h1>
                <p className="text-slate-400">Panel de Control de Pronósticos - Marzo 2026 (Corte al día {today})</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stats.map(stat => (
                    <VelocityCard key={stat.agencia} {...stat} />
                ))}
            </div>
        </main>
    )
}
