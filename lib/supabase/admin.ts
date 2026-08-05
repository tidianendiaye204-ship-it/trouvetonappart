import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec droits d'administration (Service Role Key).
 * Contourne le RLS.
 * NE DOIT ÊTRE UTILISÉ QUE CÔTÉ SERVEUR (API Routes / Server Actions sécurisées).
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Variables d\'environnement Supabase manquantes pour le client admin.')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}
