'use server'

import { createClient } from '@/lib/supabase/server'
import { MotifSignalement } from '@/types'

export async function signalerBien(bienId: string, motif: MotifSignalement, description: string) {
  try {
    const supabase = await createClient()
    
    // On essaie de récupérer l'utilisateur connecté s'il y en a un
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('signalements')
      .insert({
        bien_id: bienId,
        profil_id: user?.id || null, // Autorisé à être null pour les visiteurs non connectés
        motif,
        description,
        statut: 'nouveau'
      })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (err: any) {
    console.error('Erreur lors du signalement:', err)
    return { success: false, error: 'Une erreur est survenue lors de l\'envoi du signalement.' }
  }
}
