import { TrendingUp, TrendingDown, Target } from 'lucide-react'

export default function AgencyTableRow({ agencia, actuales, pronostico, meta, sube }) {
    const isExceedingMeta = pronostico >= meta
    // Progreso: qué tan cerca está el pronóstico de la meta
    const porcentajeProgreso = Math.min((pronostico / meta) * 100, 100) || 0

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="premium-table-cell font-semibold text-white group-hover:gold-text">{agencia}</td>
            <td className="premium-table-cell text-xl font-bold tracking-tighter">{actuales}</td>
            <td className="premium-table-cell">
                <div className="flex flex-col">
                    <span className="text-xl font-bold gold-text tracking-tighter">{pronostico}</span>
                    <span className={`text-[10px] flex items-center gap-1 ${sube ? 'text-green-400' : 'text-red-400'}`}>
                        {sube ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {sube ? 'AL ALZA' : 'BAJO FEB'}
                    </span>
                </div>
            </td>
            <td className="premium-table-cell">
                <div className="flex items-center gap-2">
                    <Target size={14} className="text-slate-500" />
                    <span className="text-xl font-bold text-slate-400 tracking-tighter">{meta}</span>
                </div>
            </td>
            <td className="premium-table-cell w-1/4">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500">
                        <span>Progreso</span>
                        <span>{Math.round(porcentajeProgreso)}%</span>
                    </div>
                    <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${isExceedingMeta
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400 neon-glow'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-400'
                                }`}
                            style={{ width: `${porcentajeProgreso}%` }}
                        />
                    </div>
                </div>
            </td>
        </tr>
    )
}
