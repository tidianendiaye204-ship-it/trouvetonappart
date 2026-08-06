'use client'

import { useEffect, useState } from 'react'
import { useFavoris } from '@/hooks/useFavoris'
import { fetchBiensByIds } from '@/app/actions/favoris'
import { Bien } from '@/types'
import CarteAnnonce from '@/components/CarteAnnonce'
import { HeartCrack, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function FavorisPage() {
  const { favoris, isLoaded } = useFavoris()
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (favoris.length === 0) {
      setBiens([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetchBiensByIds(favoris).then((data) => {
      setBiens(data)
      setLoading(false)
    })
  }, [favoris, isLoaded])

  return (
    <div className="min-h-screen bg-sable-fond pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-display font-black text-quasi-noir mb-2">Mes Favoris</h1>
        <p className="text-ardoise-gris font-medium mb-8">
          Retrouvez ici toutes vos annonces sauvegardées.
        </p>

        {!isLoaded || loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-principal animate-spin mb-4" />
            <p className="font-bold text-quasi-noir">Chargement de vos favoris...</p>
          </div>
        ) : biens.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center border border-ardoise-gris/10 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <HeartCrack className="w-10 h-10 text-ardoise-gris/50" />
            </div>
            <h2 className="text-2xl font-black text-quasi-noir mb-3">Aucun favori pour le moment</h2>
            <p className="text-ardoise-gris max-w-md mx-auto mb-8">
              Vous n&apos;avez pas encore sauvegardé d&apos;annonces. Parcourez nos biens et cliquez sur le cœur pour les retrouver ici.
            </p>
            <Link 
              href="/recherche" 
              className="bg-indigo-principal text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Explorer les biens
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {biens.map(bien => (
              <CarteAnnonce key={bien.id} bien={bien} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
