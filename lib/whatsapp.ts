export type WhatsAppTemplateId = 
  | 'premier_contact'
  | 'relance_prospect'
  | 'confirmation_visite'
  | 'relance_dossier'
  | 'rappel_loyer'
  | 'relance_retard'

export interface WhatsAppTemplateData {
  nom: string
  bien: string
  montant?: number
  date?: string
  proprietaire?: string
}

export const WHATSAPP_TEMPLATES: Record<WhatsAppTemplateId, { label: string, generate: (data: WhatsAppTemplateData) => string }> = {
  premier_contact: {
    label: 'Premier contact',
    generate: (data) => `Bonjour ${data.nom},\n\nSuite à votre intérêt pour le bien "${data.bien}", je vous contacte pour discuter de votre recherche. Êtes-vous disponible pour un échange rapide ?\n\nCordialement,${data.proprietaire ? `\n${data.proprietaire}` : ''}`
  },
  relance_prospect: {
    label: 'Relance prospect',
    generate: (data) => `Bonjour ${data.nom},\n\nJe reviens vers vous concernant le bien "${data.bien}". Êtes-vous toujours à la recherche d'un logement ?\n\nCordialement,${data.proprietaire ? `\n${data.proprietaire}` : ''}`
  },
  confirmation_visite: {
    label: 'Confirmation visite',
    generate: (data) => `Bonjour ${data.nom},\n\nJe vous confirme notre visite pour le bien "${data.bien}" prévue le ${data.date || '___'}.\n\nMerci de me prévenir en cas d'empêchement.\n\nÀ très vite !${data.proprietaire ? `\n${data.proprietaire}` : ''}`
  },
  relance_dossier: {
    label: 'Relance dossier',
    generate: (data) => `Bonjour ${data.nom},\n\nPour finaliser votre candidature sur le bien "${data.bien}", il nous manque encore quelques éléments de votre dossier. Pouvez-vous me les faire parvenir rapidement ?\n\nMerci d'avance !${data.proprietaire ? `\n${data.proprietaire}` : ''}`
  },
  rappel_loyer: {
    label: 'Rappel loyer (Préventif)',
    generate: (data) => `Bonjour ${data.nom},\n\nCeci est un petit rappel amical. Le loyer pour "${data.bien}" (${data.montant ? data.montant.toLocaleString('fr-SN') + ' CFA' : '___ CFA'}) du mois de ${data.date || '___'} est en attente de règlement.\n\nMerci de faire le nécessaire d'ici la date convenue.\n\nExcellente journée !${data.proprietaire ? `\n${data.proprietaire}` : ''}`
  },
  relance_retard: {
    label: 'Relance retard de paiement',
    generate: (data) => `Bonjour ${data.nom},\n\nSauf erreur de notre part, nous n'avons pas encore reçu le règlement du loyer de ${data.date || '___'} pour le bien "${data.bien}" (${data.montant ? data.montant.toLocaleString('fr-SN') + ' CFA' : '___ CFA'}).\n\nMerci de régulariser la situation dans les plus brefs délais.\n\nCordialement,${data.proprietaire ? `\n${data.proprietaire}` : ''}`
  }
}

/**
 * Nettoie un numéro de téléphone pour WhatsApp (enlève les espaces, tirets, etc.)
 * et s'assure qu'il commence par le format international si possible.
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  
  // Règle très simple pour le marché Sénégal (si ça commence par 7 et a 9 chiffres, on ajoute 221)
  if (cleaned.length === 9 && (cleaned.startsWith('77') || cleaned.startsWith('78') || cleaned.startsWith('76') || cleaned.startsWith('75') || cleaned.startsWith('70'))) {
    cleaned = '221' + cleaned
  }
  
  return cleaned
}

/**
 * Génère le lien wa.me
 */
export function generateWhatsAppLink(phone: string, templateId: WhatsAppTemplateId, data: WhatsAppTemplateData): string {
  const formattedPhone = formatWhatsAppNumber(phone)
  const message = WHATSAPP_TEMPLATES[templateId].generate(data)
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
}
