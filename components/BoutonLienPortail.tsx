'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

export default function BoutonLienPortail({ token, prenom }: { token: string, prenom: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const url = `${window.location.origin}/portail/${token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const url = `${window.location.origin}/portail/${token}`
    const text = encodeURIComponent(`Bonjour ${prenom},\nVoici le lien sécurisé vers votre Espace Locataire personnel pour suivre vos loyers et télécharger vos quittances :\n\n${url}\n\nÀ conserver précieusement !`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="flex flex-col gap-1 items-end mt-2">
      <button 
        onClick={handleCopy}
        className="text-xs font-bold text-indigo-principal hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
        title="Copier le lien d'accès"
      >
        {copied ? <Check className="w-3 h-3 text-green-600" /> : <Link2 className="w-3 h-3" />}
        {copied ? 'Lien copié' : 'Lien portail'}
      </button>
      
      <button 
        onClick={handleWhatsApp}
        className="text-[10px] font-bold text-green-600 hover:underline"
      >
        Envoyer par WhatsApp
      </button>
    </div>
  )
}
