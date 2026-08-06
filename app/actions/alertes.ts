'use server'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, sanitizeText } from '@/lib/security'
import { trackServerEvent } from '@/lib/analytics'

export async function createAlerte(formData: FormData) {
  // Rate limiting (max 5 alertes par heure)
  const isAllowed = await checkRateLimit('create_alerte', 5, 3600)
  if (!isAllowed) {
    return { success: false, error: "Vous avez créé trop d'alertes récemment." }
  }

  const rawEmail = formData.get('email') as string
  const rawType = formData.get('type') as string
  const rawTransaction = formData.get('transaction') as string
  const rawVille = formData.get('ville') as string
  const rawPrixMax = formData.get('prix_max') as string
  const botField = formData.get('website') as string

  // Honeypot anti-bot
  if (botField !== '') {
    return { success: true } // Fake success
  }

  if (!rawEmail || !rawEmail.includes('@')) {
    return { success: false, error: "L'email est invalide." }
  }

  const email = rawEmail.trim().toLowerCase()
  const type = rawType ? sanitizeText(rawType) : null
  const transaction = rawTransaction ? sanitizeText(rawTransaction) : null
  const ville = rawVille ? sanitizeText(rawVille) : null
  const prix_max = rawPrixMax ? parseInt(rawPrixMax, 10) : null

  const supabase = await createClient()

  // On utilise la table alertes_recherche
  const { error } = await supabase
    .from('alertes_recherche')
    .insert({
      email,
      type,
      transaction,
      ville,
      prix_max
    })

  if (error) {
    console.error("Erreur création alerte:", error)
    return { success: false, error: "Erreur lors de la création de l'alerte." }
  }

  await trackServerEvent('alerte_created', { type, transaction, ville })

  return { success: true }
}
