import { createClient } from '@supabase/supabase-js'

export type EventType = 
  | 'user_signup'
  | 'ad_created'
  | 'ad_published'
  | 'lead_received'
  | 'lead_status_changed'
  | 'sponsoring_activated'
  | 'payment_made'
  | 'lease_created'
  | 'bot_blocked'
  | 'alerte_created'

interface AnalyticsProperties {
  [key: string]: any
}

/**
 * Enregistre un événement analytique en base de données.
 * Conçu pour être appelé "Fire and Forget" depuis les Server Actions.
 * 
 * @param eventType Le type d'événement
 * @param properties Données additionnelles (JSON)
 * @param userId (Optionnel) ID du propriétaire/utilisateur concerné
 */
export async function trackServerEvent(
  eventType: EventType,
  properties: AnalyticsProperties = {},
  userId?: string | null
) {
  try {
    // On utilise un client admin local pour l'insertion backend
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )

    // Fire and forget, pas de `await` bloquant pour l'UI, mais comme on est
    // dans un Server Action, Next.js attend souvent la fin de la promesse.
    // On peut l'await pour être sûr qu'il soit écrit si la lambda s'éteint.
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: eventType,
        user_id: userId || null,
        properties
      })
  } catch (error) {
    // Ne jamais bloquer le flux principal de l'application si l'analytics échoue
    console.error(`[Analytics Error] Failed to track ${eventType}:`, error)
  }
}
