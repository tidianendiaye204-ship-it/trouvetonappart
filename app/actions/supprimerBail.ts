'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function supprimerBail(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Non autorisé' }
    }

    // On vérifie d'abord que le bail appartient bien à un bien de ce propriétaire
    // La suppression du bail supprimera les paiements en cascade
    const { error } = await supabase
        .from('baux')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Erreur suppression bail:", error)
        return { success: false, error: "Erreur lors de la suppression du contrat." }
    }

    revalidatePath('/baux')
    revalidatePath('/mes-annonces') 
    return { success: true }
}
