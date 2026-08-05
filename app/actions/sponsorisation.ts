'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * @deprecated Cette fonction est obsolète. 
 * Veuillez rediriger l'utilisateur vers la page de checkout: 
 * `/mes-annonces/${bienId}/sponsoriser` qui utilise le nouveau flux de paiement.
 */
export async function activerSponsoring(bienId: string, formData?: FormData) {
  console.warn('⚠️ L\'appel direct à activerSponsoring() est déprécié. Utilisez le flux de paiement /api/sponsoring/initier.')
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Non autorisé')
  }

  // Comportement hérité (gratuit - 7j) gardé fonctionnel temporairement
  const dateFin = new Date()
  dateFin.setDate(dateFin.getDate() + 7)

  const { error } = await supabase
    .from('biens')
    .update({ sponsorise_jusqu_a: dateFin.toISOString() })
    .eq('id', bienId)
    .eq('proprietaire_id', user.id)

  if (error) {
    console.error('Erreur lors de la sponsorisation:', error)
    throw new Error('Erreur lors de la mise en avant du bien')
  }

  revalidatePath('/mes-annonces')
  revalidatePath('/recherche')
  revalidatePath('/')
}
