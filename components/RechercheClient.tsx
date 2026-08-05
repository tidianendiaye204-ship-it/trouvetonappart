'use client'

import { useState, useCallback } from 'react'
import CarteBiens from './CarteBiens'
import CarteAnnonce from './CarteAnnonce'
import { Bien } from '@/types'

type Props = {
    biens: Bien[]
}

export default function RechercheClient({ biens }: Props) {
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const handleMouseEnter = useCallback((id: string) => setHoveredId(id), [])
    const handleMouseLeave = useCallback(() => setHoveredId(null), [])

    return (
        <div className="flex flex-col-reverse lg:flex-row flex-1 min-h-0">
            {/* ── Colonne liste ── */}
            <div className="w-full lg:w-1/2 overflow-y-auto border-t lg:border-t-0 lg:border-r border-ardoise-gris/20 h-[45vh] lg:h-full flex flex-col">
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="font-display text-2xl font-black text-quasi-noir">Trouvez votre pépite</h1>
                        <span className="text-sm font-medium text-ardoise-gris bg-ardoise-gris/10 px-3 py-1 rounded-full shrink-0">
                            {biens.length} résultat{biens.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {biens.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-ardoise-gris/10 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B93A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </div>
                            <p className="font-bold text-quasi-noir mb-1">Aucun bien trouvé</p>
                            <p className="text-sm text-ardoise-gris max-w-xs">Essayez d&apos;élargir votre budget ou de modifier vos critères.</p>
                            <a href="/recherche" className="mt-4 text-sm font-bold text-indigo-principal hover:underline">Réinitialiser les filtres</a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                            {biens.map((bien) => (
                                <div
                                    key={bien.id}
                                    onMouseEnter={() => handleMouseEnter(bien.id)}
                                    onMouseLeave={handleMouseLeave}
                                    className={`rounded-3xl transition-all duration-200 ${
                                        hoveredId === bien.id
                                            ? 'ring-2 ring-indigo-principal ring-offset-1 scale-[1.01] shadow-lg shadow-indigo-principal/10'
                                            : ''
                                    }`}
                                >
                                    <CarteAnnonce bien={bien} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Colonne carte ── */}
            <div className="w-full lg:w-1/2 h-[40vh] lg:h-full p-0">
                <CarteBiens biens={biens} hoveredBienId={hoveredId} />
            </div>
        </div>
    )
}
