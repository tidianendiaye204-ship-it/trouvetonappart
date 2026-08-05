'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function creerAgence(nom: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Non authentifié' }

    // 1. Créer l'agence
    const { data: agence, error: agenceError } = await supabase
      .from('agences')
      .insert({ nom, created_by: user.id })
      .select()
      .single()

    if (agenceError) throw agenceError

    // 2. S'ajouter comme Admin
    const { error: membreError } = await supabase
      .from('agence_membres')
      .insert({
        agence_id: agence.id,
        user_id: user.id,
        role: 'admin'
      })

    if (membreError) throw membreError

    // 3. (Optionnel) Basculer tous les biens actuels vers cette agence
    await supabase
      .from('biens')
      .update({ agence_id: agence.id })
      .eq('proprietaire_id', user.id)
      .is('agence_id', null)

    revalidatePath('/dashboard/equipe')
    return { success: true, agence }
  } catch (error: any) {
    console.error("Erreur création agence", error)
    return { success: false, error: error.message }
  }
}

export async function inviterMembre(agenceId: string, email: string, role: string) {
  // Dans un vrai projet de prod, on utiliserait supabase.auth.admin.inviteUserByEmail
  // qui nécessite le service_role key.
  // Pour le moment, on retourne un succès fictif ou on insère dans une table d'invitations.
  
  try {
    console.log(`[Simulation] Invitation envoyée à ${email} pour l'agence ${agenceId} (Rôle: ${role})`)
    
    // Fake délai
    await new Promise(r => setTimeout(r, 1000))

    revalidatePath('/dashboard/equipe')
    return { success: true, message: `Une invitation a été envoyée à ${email}` }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
