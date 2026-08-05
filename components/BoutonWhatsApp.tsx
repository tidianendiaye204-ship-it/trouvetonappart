'use client'

import { MessageCircle } from 'lucide-react'

type BoutonWhatsAppProps = {
  locataireNom: string
  mois: string
  annee: number
  montant: number
  paiementId: string
  telephone?: string
}

export default function BoutonWhatsApp({ 
  locataireNom, 
  mois, 
  annee, 
  montant, 
  paiementId, 
  telephone 
}: BoutonWhatsAppProps) {
  
  const handleRelance = () => {
    // 1. Construire l'URL publique
    const urlPaiement = `${window.location.origin}/paiement-loyer/${paiementId}`
    
    // 2. Construire le message (100% personnalisable)
    const message = `Bonjour ${locataireNom},\n\nSauf erreur de notre part, le loyer de ${mois} ${annee} d'un montant de ${new Intl.NumberFormat('fr-SN').format(montant)} CFA n'a pas encore été réglé.\n\nVous pouvez le régler en toute sécurité via ce lien :\n${urlPaiement}\n\nMerci et bonne journée !`
    
    // 3. Encoder pour URL
    const messageEncode = encodeURIComponent(message)
    
    // 4. Si on a un téléphone, on essaie de l'utiliser. Sinon on ouvre WhatsApp générique
    // Nettoyage basique du numéro (enlève les espaces, etc.)
    const telPropre = telephone ? telephone.replace(/\D/g, '') : ''
    
    // Si le numéro commence par 00, on remplace par +. 
    // Attention : pour WhatsApp, il faut l'indicatif pays sans le + ni 00. (ex: 22177...)
    // S'il n'y a pas d'indicatif, ça ouvrira quand même l'app mais ça demandera de choisir le contact si le numéro n'est pas reconnu.
    const waUrl = telPropre 
      ? `https://wa.me/${telPropre}?text=${messageEncode}` 
      : `https://wa.me/?text=${messageEncode}`

    window.open(waUrl, '_blank')
  }

  return (
    <button 
      onClick={handleRelance}
      className="text-xs font-bold bg-[#25D366]/10 text-[#075E54] px-3 py-1.5 rounded-full hover:bg-[#25D366] hover:text-white transition-colors flex items-center gap-1.5"
      title="Relancer par WhatsApp"
    >
      <MessageCircle className="w-3.5 h-3.5" />
      WhatsApp
    </button>
  )
}
