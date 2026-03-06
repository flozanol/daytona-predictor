export default function KpiCard({ label, value, subtext, confidence }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl flex flex-col justify-between h-full">
            <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">{label}</p>
                <p className={`text-5xl font-extrabold tracking-tighter ${label.includes('Pronóstico') ? 'text-green-400' : 'text-white'}`}>
                    {value}
                </p>
            </div>
            {confidence ? (
                <div className="mt-8 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500/50" style={{ width: '85%' }} />
                    </div>
                    <span className="text-[10px] font-bold text-green-400">{confidence}%</span>
                </div>
            ) : (
                <p className="text-sm text-slate-500 mt-4">{subtext}</p>
            )}
        </div>
    )
}
