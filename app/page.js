import { supabase } from '@/lib/supabase'
import { calcularPronosticoDaytona, calcularPronostico20 } from '@/lib/forecast'

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

import PredictorDashboard from '@/components/PredictorDashboard'

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

        // Métricas de "Bodega" v2
        const leads = marchAgencia.reduce((acc, r) => acc + (r.leads_recibidos || 0), 0)
        const contactados = marchAgencia.reduce((acc, r) => acc + (r.leads_contactados || 0), 0)
        const citasAgendadas = marchAgencia.reduce((acc, r) => acc + (r.citas_agendadas || 0), 0)
        const citasEfectivas = marchAgencia.reduce((acc, r) => acc + (r.citas_efectivas || 0), 0)

        const visitas = marchAgencia.reduce((acc, r) => acc + (r.total_visitas_piso || 0), 0)
        const pruebas = marchAgencia.reduce((acc, r) => acc + (r.pruebas_manejo_total || 0), 0)
        const financiera = marchAgencia.reduce((acc, r) => acc + (r.solicitudes_financiera || 0), 0)
        const aprobados = marchAgencia.reduce((acc, r) => acc + (r.aprobados_financiera || 0), 0)
        const avaluos = marchAgencia.reduce((acc, r) => acc + (r.avaluos_total || 0), 0)

        const probables = marchAgencia.reduce((acc, r) => acc + (r.ventas_probables_48_hrs || 0), 0)
        const apartados = marchAgencia.reduce((acc, r) => acc + (r.apartados_dia || 0), 0)

        const pronosticoNuevos = calcularPronosticoDaytona(ventasNuevosHoy, diaCorte, agencia)
        const pronosticoSemis = calcularPronosticoDaytona(ventasSemisHoy, diaCorte, agencia)
        const pronosticoCierre20 = calcularPronostico20(ventasNuevosHoy, apartados, probables)

        const cierreFebTotal = febAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0) + (r.ventas_seminuevos || 0), 0)
        const febNuevos = febAgencia.reduce((acc, r) => acc + (r.ventas_nuevos || 0), 0)
        const febSemis = febAgencia.reduce((acc, r) => acc + (r.ventas_seminuevos || 0), 0)

        return {
            agencia,
            ventasNuevosHoy,
            ventasSemisHoy,
            febNuevos,
            febSemis,
            pronosticoNuevos,
            pronosticoSemis,
            pronostico20: pronosticoCierre20,
            pronosticoTotal: pronosticoCierre20 + pronosticoSemis,
            tendenciaPositiva: (pronosticoCierre20 + pronosticoSemis) > cierreFebTotal,
            probables,
            apartados,
            leads,
            funnel: {
                digital: { leads, contactados, citasAgendadas, citasEfectivas, ventas: ventasNuevosHoy },
                showroom: { visitas, pruebas, financiera, aprobados, avaluos, ventas: ventasNuevosHoy }
            }
        }
    })

    const globalVentasNuevos = stats.reduce((acc, s) => acc + s.ventasNuevosHoy, 0)
    const globalVentasSemis = stats.reduce((acc, s) => acc + s.ventasSemisHoy, 0)
    const globalFebNuevos = stats.reduce((acc, s) => acc + s.febNuevos, 0)
    const globalFebSemis = stats.reduce((acc, s) => acc + s.febSemis, 0)
    const globalPronostico = stats.reduce((acc, s) => acc + s.pronosticoTotal, 0)

    return (
        <PredictorDashboard
            initialStats={stats}
            agencias={agencias}
            globalFebBaselines={{ nuevos: globalFebNuevos, semis: globalFebSemis }}
        />
    )
}
