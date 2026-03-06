import { TrendingUp, TrendingDown } from 'lucide-react'

export default function VelocityCard({ agencia, actuales, pronostico, cierreFeb, sube }) {
    const porcentajeProgreso = Math.min((actuales / pronostico) * 100, 100) || 0

    return (
        <div className="premium-gradient border border-[#D4AF37]/10 rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all duration-500 group shadow-2xl">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-slate-100 group-hover:gold-text transition-colors">{agencia}</h3>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sube ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {sube ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {sube ? 'AL ALZA' : 'BAJO FEBRERO'}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-3xl font-bold text-white tracking-tighter">{actuales}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Ventas Hoy</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold gold-text tracking-tighter">{pronostico}</p>
                        <p className="text-xs text-[#D4AF37]/60 uppercase tracking-widest mt-1">Pronóstico Cierre</p>
                    </div>
                </div>

                <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
                        style={{ width: `${porcentajeProgreso}%` }}
                    />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Cierre Febrero</p>
                    <p className="text-sm font-semibold text-slate-300">{cierreFeb}</p>
                </div>
            </div>
        </div>
    )
}
