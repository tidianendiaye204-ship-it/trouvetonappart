'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { StatutCompte, StatutModeration, StatutSignalement } from '@/types'

// Helper pour vérifier l'admin en Server Action
async function assertAdmin(supabase: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, statut_compte')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.statut_compte !== 'actif') {
    throw new Error('Non autorisé')
  }

  return user.id
}

// Helper pour journaliser les actions admin
async function logAdminAction(supabase: any, adminId: string, action: string, cibleId: string | null, details: Record<string, unknown> = {}) {
  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    cible_id: cibleId,
    details
  })
}

export async function changerStatutCompte(userId: string, nouveauStatut: StatutCompte) {
  try {
    const supabase = await createClient()
    const adminId = await assertAdmin(supabase)

    const { error } = await supabase
      .from('profiles')
      .update({ statut_compte: nouveauStatut })
      .eq('id', userId)

    if (error) throw error

    await logAdminAction(supabase, adminId, 'changer_statut_compte', userId, { nouveauStatut })
    revalidatePath('/admin/utilisateurs')
    return { success: true }
  } catch (err: any) {
    console.error('Erreur changerStatutCompte:', err)
    return { success: false, error: err.message }
  }
}

export async function modererBien(bienId: string, nouveauStatut: StatutModeration, raison?: string) {
  try {
    const supabase = await createClient()
    const adminId = await assertAdmin(supabase)

    const { error } = await supabase
      .from('biens')
      .update({ statut_moderation: nouveauStatut })
      .eq('id', bienId)

    if (error) throw error

    await logAdminAction(supabase, adminId, 'moderer_bien', bienId, { nouveauStatut, raison })
    
    // Invalider les caches concernés
    revalidatePath('/admin/annonces')
    revalidatePath(`/annonce/${bienId}`)
    revalidatePath('/recherche')
    
    return { success: true }
  } catch (err: any) {
    console.error('Erreur modererBien:', err)
    return { success: false, error: err.message }
  }
}

export async function traiterSignalement(signalementId: string, nouveauStatut: StatutSignalement) {
  try {
    const supabase = await createClient()
    const adminId = await assertAdmin(supabase)

    const { error } = await supabase
      .from('signalements')
      .update({ statut: nouveauStatut })
      .eq('id', signalementId)

    if (error) throw error

    await logAdminAction(supabase, adminId, 'traiter_signalement', signalementId, { nouveauStatut })
    revalidatePath('/admin/signalements')
    return { success: true }
  } catch (err: any) {
    console.error('Erreur traiterSignalement:', err)
    return { success: false, error: err.message }
  }
}

export async function changerRole(userId: string, nouveauRole: 'proprietaire' | 'chercheur' | 'admin') {
  try {
    const supabase = await createClient()
    const adminId = await assertAdmin(supabase)

    // Un admin ne peut pas enlever le rôle admin au seul admin existant, mais pour simplifier ici on autorise
    const { error } = await supabase
      .from('profiles')
      .update({ role: nouveauRole })
      .eq('id', userId)

    if (error) throw error

    await logAdminAction(supabase, adminId, 'changer_role', userId, { nouveauRole })
    revalidatePath('/admin/utilisateurs')
    return { success: true }
  } catch (err: any) {
    console.error('Erreur changerRole:', err)
    return { success: false, error: err.message }
  }
}
