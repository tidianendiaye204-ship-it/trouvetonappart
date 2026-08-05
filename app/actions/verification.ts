'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyPhotos(bienId: string, action: 'verify' | 'unverify') {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non autorisé")

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error("Accès refusé")

    const isVerified = action === 'verify'

    // 1. Update Bien
    const { error: updateError } = await supabase
      .from('biens')
      .update({ photos_verified: isVerified })
      .eq('id', bienId)

    if (updateError) throw updateError

    // 2. Log Action
    await supabase.from('verification_logs').insert({
      admin_id: user.id,
      target_type: 'bien',
      target_id: bienId,
      action: isVerified ? 'photos_verified' : 'photos_unverified',
      notes: isVerified ? 'Photos vérifiées manuellement par admin' : 'Vérification retirée'
    })

    revalidatePath('/admin/annonces')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function verifyOwner(profileId: string, action: 'verify' | 'unverify') {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non autorisé")

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error("Accès refusé")

    const isVerified = action === 'verify'

    // 1. Update Profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_verified: isVerified })
      .eq('id', profileId)

    if (updateError) throw updateError

    // 2. Log Action
    await supabase.from('verification_logs').insert({
      admin_id: user.id,
      target_type: 'profile',
      target_id: profileId,
      action: isVerified ? 'owner_verified' : 'owner_unverified',
      notes: isVerified ? 'Identité vérifiée' : 'Vérification retirée'
    })

    revalidatePath('/admin/utilisateurs')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
