'use server'

import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, isValidPhone, sanitizeText } from '@/lib/security'
import { trackServerEvent } from '@/lib/analytics'

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function submitContact(formData: FormData) {
  // --- 1. RATE LIMITING ---
  // Max 3 envois par minute par IP
  const isAllowed = await checkRateLimit('contact_submit', 3, 60)
  if (!isAllowed) {
    return { success: false, error: "Vous avez envoyé trop de requêtes. Veuillez patienter 1 minute." }
  }

  const token = formData.get('cf-turnstile-response')
  const rawNom = formData.get('nom') as string
  const rawTelephone = formData.get('telephone') as string
  const rawMessage = formData.get('message') as string
  const bienId = formData.get('bienId') as string
  const botField = formData.get('website') as string

  // --- 2. HONEYPOT ANTI-BOT ---
  if (botField !== '') {
    console.warn("Honeypot filled by bot.")
    await trackServerEvent('bot_blocked', { reason: 'honeypot', endpoint: 'contact' })
    return { success: true } // Fake success for bot
  }

  // --- 3. VALIDATION & SANITIZATION STRICTES ---
  if (!rawNom || !rawTelephone || !bienId) {
    return { success: false, error: "Veuillez remplir tous les champs obligatoires." }
  }

  const nom = sanitizeText(rawNom.trim())
  const telephone = sanitizeText(rawTelephone.trim())
  const message = sanitizeText(rawMessage?.trim() || '')

  if (nom.length > 100) return { success: false, error: "Le nom est trop long." }
  if (message.length > 2000) return { success: false, error: "Le message est trop long (2000 caractères max)." }
  if (!isValidPhone(telephone)) return { success: false, error: "Le numéro de téléphone est invalide." }

  // --- 4. VERIFICATION TURNSTILE STRICTE ---
  const isDev = process.env.NODE_ENV === 'development';
  const secretKey = isDev ? '1x0000000000000000000000000000000AA' : TURNSTILE_SECRET_KEY;

  if (secretKey) {
    if (!token) {
      return { success: false, error: "Veuillez valider le Captcha." };
    }
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token as string)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = await res.json();
    if (!data.success) {
      console.error('Echec Turnstile:', data);
      return { success: false, error: 'Validation Captcha échouée.' };
    }
  }

  // --- 5. INSERTION BASE DE DONNEES ---
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Variables Supabase manquantes dans le serveur.")
    return { success: false, error: "Erreur de configuration serveur." }
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: insertedContact, error } = await supabaseAdmin
    .from('contacts_demandes')
    .insert({
      bien_id: bienId,
      nom_demandeur: nom,
      telephone_demandeur: telephone,
      message,
    })
    .select('id')
    .single()

  if (error) {
    console.error("Erreur insertion contact", error)
    return { success: false, error: "Erreur lors de l'envoi du message." }
  }

  // --- 6. TRACKING ANALYTICS ---
  // On récupère le proprietaire_id du bien pour l'associer au lead
  const { data: bien } = await supabaseAdmin
    .from('biens')
    .select('proprietaire_id')
    .eq('id', bienId)
    .single()

  await trackServerEvent('lead_received', {
    bien_id: bienId,
    contact_id: insertedContact.id,
    has_message: !!message
  }, bien?.proprietaire_id)

  return { success: true }
}

// Action pour logger un clic rapide (WhatsApp / Appel) sans formulaire
export async function logQuickContact(bienId: string, type: 'whatsapp' | 'telephone') {
  // Limite de taux: 5 clics par minute par IP pour éviter le spam
  const isAllowed = await checkRateLimit('quick_contact_submit', 5, 60)
  if (!isAllowed) {
    return { success: false, error: 'Trop de requêtes' }
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
  
  const label = type === 'whatsapp' ? 'Clic sur WhatsApp' : 'Clic sur Appeler'
  
  const { error } = await supabase
    .from('contacts_demandes')
    .insert([{
      bien_id: bienId,
      nom_demandeur: 'Lead Anonyme (Clic)',
      telephone_demandeur: 'Non fourni',
      message: label,
      statut: 'nouveau'
    }])

  if (error) {
    console.error(`Erreur lors du log du clic ${type}:`, error)
    return { success: false, error: error.message }
  }

  await trackServerEvent('quick_contact_generated', { bienId, type })
  return { success: true }
}
