'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/security'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_FILES_PER_DOSSIER = 10

export async function uploadDocument(formData: FormData) {
  // --- 1. RATE LIMITING ---
  // Max 20 requêtes d'upload par minute (pour éviter un flood scripté)
  const isAllowed = await checkRateLimit('dossier_upload', 20, 60)
  if (!isAllowed) {
    return { success: false, error: "Trop de requêtes. Veuillez patienter." }
  }

  const file = formData.get('file') as File
  const token = formData.get('token') as string
  const type = formData.get('type') as string

  // --- 2. VALIDATION STRICTE DU FICHIER ---
  if (!file || !token || !type) {
    return { success: false, error: 'Informations manquantes' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Le fichier dépasse la limite de 5Mo' }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: 'Type de fichier non autorisé (Seuls PDF, JPG, PNG)' }
  }

  // --- 3. VERIFICATION DU TOKEN ---
  const { data: demande } = await supabaseAdmin
    .from('contacts_demandes')
    .select('id, dossier_statut')
    .eq('dossier_token', token)
    .single()

  if (!demande) {
    return { success: false, error: 'Lien invalide ou expiré' }
  }

  // --- 4. VERIFICATION DU QUOTA ---
  const { count } = await supabaseAdmin
    .from('dossiers_documents')
    .select('*', { count: 'exact', head: true })
    .eq('demande_id', demande.id)

  if (count && count >= MAX_FILES_PER_DOSSIER) {
    return { success: false, error: 'Vous avez atteint la limite maximale de documents pour ce dossier.' }
  }

  // --- 5. UPLOAD SECURISE ---
  // Assainissement du nom de fichier
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const safeExt = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext) ? ext : 'bin'
  const fileName = `${demande.id}/${type.replace(/[^a-z0-9_]/g, '')}_${Date.now()}.${safeExt}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('dossiers-prives')
    .upload(fileName, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error('Erreur Storage:', uploadError)
    return { success: false, error: "Erreur lors du transfert sécurisé du fichier" }
  }

  // --- 6. ENREGISTREMENT BDD ---
  const { error: dbError } = await supabaseAdmin
    .from('dossiers_documents')
    .insert({
      demande_id: demande.id,
      type_document: type.replace(/[^a-z0-9_]/g, ''),
      file_path: fileName,
      statut_validation: 'en_attente'
    })

  if (dbError) {
    console.error('Erreur BDD:', dbError)
    return { success: false, error: 'Erreur lors de la sauvegarde en base' }
  }

  // Mise à jour du statut du dossier si nécessaire
  if (demande.dossier_statut === 'vide') {
    await supabaseAdmin
      .from('contacts_demandes')
      .update({ dossier_statut: 'incomplet' })
      .eq('id', demande.id)
  }

  revalidatePath(`/candidature/${token}`)
  return { success: true }
}

export async function submitDossier(token: string) {
  // Limite de soumission (pour éviter le spam du bouton)
  const isAllowed = await checkRateLimit('dossier_submit', 5, 60)
  if (!isAllowed) return { success: false, error: "Trop de requêtes." }

  const { data: demande } = await supabaseAdmin
    .from('contacts_demandes')
    .select('id')
    .eq('dossier_token', token)
    .single()

  if (!demande) return { success: false, error: 'Lien invalide' }

  await supabaseAdmin
    .from('contacts_demandes')
    .update({ dossier_statut: 'en_revue' })
    .eq('id', demande.id)

  revalidatePath(`/candidature/${token}`)
  return { success: true }
}
