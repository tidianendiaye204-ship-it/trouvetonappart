import { createClient } from '@/lib/supabase/server'
import { Bien } from '@/types'

/**
 * Récupère tous les biens d'un propriétaire spécifique
 */
export async function getBiensProprietaire(proprietaireId: string): Promise<Bien[]> {
  const supabase = await createClient()
  const { data: biens, error } = await supabase
    .from('biens')
    .select('*, biens_images(url, ordre)')
    .eq('proprietaire_id', proprietaireId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur getBiensProprietaire:', error)
    return []
  }

  // Formatage pour typer correctement et trier les images
  return (biens || []).map((b) => ({
    ...b,
    biens_images: b.biens_images?.sort((a: any, c: any) => a.ordre - c.ordre) || [],
    image_principale: b.biens_images?.sort((a: any, c: any) => a.ordre - c.ordre)[0]?.url || null,
  })) as unknown as Bien[]
}

/**
 * Récupère les biens publics pour la recherche
 */
export async function searchBiensPubliques(filtres?: {
  type?: string
  transaction?: string
  ville?: string
}): Promise<Bien[]> {
  const supabase = await createClient()

  let query = supabase
    .from('biens')
    .select('id, titre, type, transaction, prix, superficie, nb_chambres, quartier, ville, adresse, latitude, longitude, sponsorise_jusqu_a, telephone, whatsapp, biens_images(url, ordre)')
    .eq('publie', true)
    .order('sponsorise_jusqu_a', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (filtres?.type) query = query.eq('type', filtres.type)
  if (filtres?.transaction) query = query.eq('transaction', filtres.transaction)
  if (filtres?.ville) {
    query = query.or(`ville.ilike.%${filtres.ville}%,quartier.ilike.%${filtres.ville}%,adresse.ilike.%${filtres.ville}%`)
  }

  const { data: biens, error } = await query

  if (error) {
    console.error('Erreur searchBiensPubliques:', error)
    return []
  }

  return (biens || []).map((b) => ({
    ...b,
    image_principale: b.biens_images?.sort((a: any, c: any) => a.ordre - c.ordre)[0]?.url || null,
  })) as unknown as Bien[]
}

/**
 * Récupère un bien spécifique par son ID
 */
export async function getBienById(id: string): Promise<Bien | null> {
  const supabase = await createClient()
  const { data: bien, error } = await supabase
    .from('biens')
    .select('*, biens_images(url, ordre)')
    .eq('id', id)
    .single()

  if (error || !bien) {
    console.error('Erreur getBienById:', error)
    return null
  }

  return {
    ...bien,
    biens_images: bien.biens_images?.sort((a: any, c: any) => a.ordre - c.ordre) || [],
  } as unknown as Bien
}
