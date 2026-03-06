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

import DashboardClient from '@/components/DashboardClient'

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
        <DashboardClient
            initialStats={stats}
            agencias={agencias}
            diaCorte={diaCorte}
        />
    )
}
