'use server'

import { createClient } from '@supabase/supabase-js'

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function submitContact(formData: FormData) {
  const token = formData.get('cf-turnstile-response')
  const nom = formData.get('nom') as string
  const telephone = formData.get('telephone') as string
  const message = formData.get('message') as string
  const bienId = formData.get('bienId') as string
  const botField = formData.get('website') as string

  // 1. Honeypot check
  if (botField !== '') {
    console.warn("Honeypot filled by bot.")
    return { success: true } // Fake success for bot
  }

  // 2. Validation basique
  if (!nom || !telephone || !bienId) {
    return { success: false, error: "Veuillez remplir tous les champs obligatoires." }
  }

  // 3. Vérification Turnstile
  if (!token) {
    return { success: false, error: "Veuillez valider le Captcha." }
  }

  if (!TURNSTILE_SECRET_KEY) {
    console.error("Clé secrète Turnstile manquante")
    // En développement, si la clé manque on passe, mais en prod ça devrait échouer
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: "Erreur de configuration serveur." }
    }
  } else {
    // Appel à l'API Cloudflare
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${encodeURIComponent(TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(token as string)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const data = await res.json()
    if (!data.success) {
      console.error("Echec Turnstile:", data)
      return { success: false, error: "Validation Captcha échouée." }
    }
  }

  // 4. Insertion en base de données avec contournement RLS sécurisé (Service Role)
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Variables Supabase manquantes dans le serveur.")
    return { success: false, error: "Erreur de configuration serveur." }
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { error } = await supabaseAdmin
    .from('contacts_demandes')
    .insert({
      bien_id: bienId,
      nom_demandeur: nom,
      telephone_demandeur: telephone,
      message,
    })

  if (error) {
    console.error("Erreur insertion contact", error)
    return { success: false, error: "Erreur lors de l'envoi du message." }
  }

  return { success: true }
}
