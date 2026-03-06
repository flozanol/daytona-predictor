'use client'

import { useState } from 'react'

export default function DashboardFilters({ agencias, onFilterChange, currentFilter }) {
    const [isOpen, setIsOpen] = useState(false)

    const groups = {
        'MG': ['MG Cuajimalpa', 'MG Interlomas', 'MG Iztapalapa', 'MG Santa Fe'],
        'KIA': ['KIA Interlomas', 'KIA Iztapalapa'],
        'Honda': ['Honda Cuajimalpa', 'Honda Interlomas'],
        'GWM': ['GWM Cuernavaca', 'GWM Iztapalapa'],
        'Acura': ['Acura']
    }

    const handleSelect = (type, value) => {
        onFilterChange({ type, value })
        setIsOpen(false)
    }

    return (
        <div className="relative flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md z-50">
            <button
                onClick={() => handleSelect('all', 'Total')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${currentFilter.type === 'all'
                        ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
            >
                Grupo Daytona
            </button>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentFilter.type !== 'all'
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    {currentFilter.type === 'all' ? 'Filtrar Agencia' : currentFilter.value}
                    <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>↓</span>
                </button>

                {isOpen && (
                    <div className="fixed top-[110%] right-0 mt-2 w-64 glass-card p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Marcas</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {Object.keys(groups).map(group => (
                                        <button
                                            key={group}
                                            onClick={() => handleSelect('group', group)}
                                            className="px-3 py-2 text-left text-[11px] font-bold hover:bg-white/10 rounded-lg transition-colors text-cyan-400"
                                        >
                                            {group}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Agencias Individuales</p>
                                <div className="space-y-1">
                                    {agencias.map(agencia => (
                                        <button
                                            key={agencia}
                                            onClick={() => handleSelect('agency', agencia)}
                                            className="w-full px-3 py-2 text-left text-[11px] font-medium hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {agencia}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
