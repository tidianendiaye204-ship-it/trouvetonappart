'use client'

import { useState } from 'react'
import { Link2, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function BoutonLienPaiement({ paiementId }: { paiementId: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    // Construire l'URL publique
    const url = `${window.location.origin}/paiement-loyer/${paiementId}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie du lien:', err)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={handleCopy}
        className="text-xs font-bold bg-safran-accent/10 text-quasi-noir px-3 py-1.5 rounded-full hover:bg-safran-accent transition-colors flex items-center gap-1.5"
        title="Copier le lien de paiement pour le locataire"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emeraude" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? 'Copié !' : 'Lien Paiement'}
      </button>
      
      <Link
        href={`/paiement-loyer/${paiementId}`}
        target="_blank"
        className="p-1.5 text-ardoise-gris hover:text-quasi-noir hover:bg-ardoise-gris/10 rounded-full transition-colors"
        title="Ouvrir le lien de paiement"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
