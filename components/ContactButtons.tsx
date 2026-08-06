'use client'

import { useState } from 'react'
import { logQuickContact } from '@/app/actions/contact'

type ContactButtonsProps = {
  bienId: string
  titre: string
  telephone?: string
  whatsapp?: string
}

export default function ContactButtons({ bienId, titre, telephone, whatsapp }: ContactButtonsProps) {
  const [loadingType, setLoadingType] = useState<'whatsapp' | 'telephone' | null>(null)

  const handleAction = async (type: 'whatsapp' | 'telephone', url: string) => {
    // 1. Prévenir les doubles clics
    if (loadingType) return
    setLoadingType(type)

    // 2. Logger le clic discrètement en base de données
    await logQuickContact(bienId, type).catch(console.error)

    // 3. Ouvrir l'application demandée
    window.open(url, '_blank', 'noopener,noreferrer')
    
    setLoadingType(null)
  }

  const whatsappText = encodeURIComponent(`Bonjour, j'ai vu votre annonce "${titre}" sur TrouveTonAppart. Serait-il possible de m'envoyer une petite vidéo du bien ici sur WhatsApp s'il vous plaît ?`)
  const whatsappNumber = whatsapp?.replace(/\D/g, '')

  return (
    <div className="mb-8 space-y-3">
      <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-3">Contacter le propriétaire</p>
      
      {telephone && (
        <button
          onClick={() => handleAction('telephone', `tel:${telephone}`)}
          disabled={loadingType !== null}
          className="flex items-center justify-center gap-3 w-full bg-indigo-principal/10 hover:bg-indigo-principal text-indigo-principal hover:text-white rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 group disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Appeler · {telephone}
        </button>
      )}

      {whatsapp && (
        <>
          <button
            onClick={() => handleAction('whatsapp', `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${titre}" sur TrouveTonAppart.`)}`)}
            disabled={loadingType !== null}
            className="flex items-center justify-center gap-3 w-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 group disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>

          {/* Bouton Vidéo */}
          <button
            onClick={() => handleAction('whatsapp', `https://wa.me/${whatsappNumber}?text=${whatsappText}`)}
            disabled={loadingType !== null}
            className="flex items-center justify-center gap-3 w-full bg-safran-accent/10 hover:bg-safran-accent text-safran-accent-dark hover:text-quasi-noir rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 group mt-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Demander une vidéo WhatsApp
          </button>
        </>
      )}
    </div>
  )
}
