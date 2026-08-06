'use client'

import { Share2 } from 'lucide-react'

type Props = {
  titre: string
}

export default function BoutonPartagerNatif({ titre }: Props) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: titre,
          text: `Découvrez cette annonce immobilière : ${titre}`,
          url: window.location.href,
        })
      } catch (error) {
        // L'utilisateur a peut-être annulé le partage, pas besoin de faire d'alerte
        console.log('Partage annulé ou erreur', error)
      }
    } else {
      // Fallback si l'API Web Share n'est pas supportée (ex: certains navigateurs de bureau)
      navigator.clipboard.writeText(window.location.href)
      alert("Lien de l'annonce copié dans le presse-papier !")
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-3 w-full bg-ardoise-gris/10 hover:bg-ardoise-gris/20 text-quasi-noir rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 group mt-3"
    >
      <Share2 className="w-5 h-5 text-ardoise-gris group-hover:text-quasi-noir transition-colors" />
      Partager l'annonce
    </button>
  )
}
