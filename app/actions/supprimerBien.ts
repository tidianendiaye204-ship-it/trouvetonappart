'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function supprimerBien(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Non autorisé')
    }

    // On s'assure que le bien appartient à l'utilisateur avant de supprimer
    const { error } = await supabase
        .from('biens')
        .delete()
        .eq('id', id)
        .eq('proprietaire_id', user.id)

    if (error) {
        console.error("Erreur suppression:", error)
        throw new Error("Erreur lors de la suppression.")
    }

    revalidatePath('/mes-annonces')
}
