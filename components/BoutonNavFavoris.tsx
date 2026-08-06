'use client'

import { useFavoris } from '@/hooks/useFavoris'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function BoutonNavFavoris() {
  const { favoris, isLoaded } = useFavoris()

  if (!isLoaded) {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-ardoise-gris/20 flex items-center justify-center opacity-50">
        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-ardoise-gris" />
      </div>
    )
  }

  const count = favoris.length

  return (
    <Link 
      href="/favoris"
      className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-ardoise-gris/20 flex items-center justify-center hover:border-indigo-principal hover:text-indigo-principal transition-all text-ardoise-gris bg-white group shadow-sm hover:shadow-md"
      title="Mes favoris"
    >
      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${count > 0 ? 'text-red-500 fill-red-500/20' : 'group-hover:text-red-500'}`} />
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
          {count}
        </span>
      )}
    </Link>
  )
}
