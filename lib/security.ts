import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Vérifie si l'IP de la requête a dépassé sa limite pour cet endpoint.
 * @param endpoint Nom de l'action/endpoint (ex: 'contact_submit', 'dossier_upload')
 * @param maxRequests Nombre maximum de requêtes autorisées
 * @param windowSecs Fenêtre de temps en secondes (ex: 60 = 1 minute)
 * @returns boolean true si autorisé, false si bloqué
 */
export async function checkRateLimit(endpoint: string, maxRequests: number = 5, windowSecs: number = 60): Promise<boolean> {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
    
    // On extrait la première IP si x-forwarded-for contient une liste
    const clientIp = ip.split(',')[0].trim()

    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_ip: clientIp,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSecs
    })

    if (error) {
      console.error('Erreur RPC check_rate_limit:', error)
      // En cas d'erreur de base de données, on autorise pour ne pas bloquer les utilisateurs légitimes
      return true
    }

    return data === true
  } catch (error) {
    console.error('Erreur checkRateLimit:', error)
    return true
  }
}

/**
 * Valide un numéro de téléphone au format basique (autorise +, espaces, et chiffres)
 */
export function isValidPhone(phone: string): boolean {
  return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phone)
}

/**
 * Nettoie une chaîne de caractères pour éviter l'injection de balises HTML basiques
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
