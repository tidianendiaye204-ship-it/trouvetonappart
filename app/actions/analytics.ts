'use server'

import { trackServerEvent, EventType } from '@/lib/analytics'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action pour permettre aux composants clients (ex: CRM)
 * de déclencher un événement analytique en toute sécurité.
 */
export async function trackClientEvent(eventType: EventType, properties: any = {}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Le serveur transmet l'ID de l'utilisateur authentifié
    await trackServerEvent(eventType, properties, user?.id)
  } catch (error) {
    console.error('Error in trackClientEvent:', error)
  }
}
