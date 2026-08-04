'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function activerSponsoring(bienId: string, formData?: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Non autorisé')
  }

  // Calculer la date dans 7 jours
  const dateFin = new Date()
  dateFin.setDate(dateFin.getDate() + 7)

  // Mettre à jour le bien
  const { error } = await supabase
    .from('biens')
    .update({ sponsorise_jusqu_a: dateFin.toISOString() })
    .eq('id', bienId)
    .eq('proprietaire_id', user.id) // Sécurité supplémentaire

  if (error) {
    console.error('Erreur lors de la sponsorisation:', error)
    throw new Error('Erreur lors de la mise en avant du bien')
  }

  // Invalider les caches
  revalidatePath('/mes-annonces')
  revalidatePath('/recherche')
  revalidatePath('/')
}
