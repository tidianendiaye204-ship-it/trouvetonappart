'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function supprimerLocataire(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Non autorisé' }
    }

    const { error } = await supabase
        .from('locataires')
        .delete()
        .eq('id', id)
        .eq('proprietaire_id', user.id)

    if (error) {
        console.error("Erreur suppression locataire:", error)
        if (error.code === '23503') {
            return { success: false, error: "Impossible de supprimer ce locataire car il est lié à un ou plusieurs contrats de location (baux)." }
        }
        return { success: false, error: "Erreur lors de la suppression du locataire." }
    }

    revalidatePath('/locataires')
    revalidatePath('/mes-annonces')
    return { success: true }
}
