'use client'

import { useFavoris } from '@/hooks/useFavoris'
import { Heart } from 'lucide-react'
import { MouseEvent } from 'react'

export default function BoutonFavori({ bienId }: { bienId: string }) {
  const { isFavori, toggleFavori, isLoaded } = useFavoris()

  if (!isLoaded) return null // Évite le saut visuel au chargement

  const favori = isFavori(bienId)

  const handleToggle = (e: MouseEvent) => {
    e.preventDefault() // Empêche le clic de propager vers le lien parent (CarteAnnonce)
    e.stopPropagation()
    toggleFavori(bienId)
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
        favori 
          ? 'bg-white text-red-500 hover:bg-gray-50' 
          : 'bg-black/20 text-white hover:bg-black/40'
      }`}
      aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart className="w-5 h-5" fill={favori ? "currentColor" : "none"} strokeWidth={favori ? 0 : 2} />
    </button>
  )
}
