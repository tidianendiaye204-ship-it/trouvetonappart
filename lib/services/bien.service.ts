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
  return (biens || []).map((b) => {
    const images = Array.isArray(b.biens_images) ? [...b.biens_images] : []
    const sortedImages = images.sort((a: any, c: any) => (a.ordre || 0) - (c.ordre || 0))
    return {
      ...b,
      biens_images: sortedImages,
      image_principale: sortedImages.length > 0 ? sortedImages[0].url : null,
    }
  }) as unknown as Bien[]
}

/**
 * Récupère les biens publics pour la recherche
 */
export async function searchBiensPubliques(filtres?: {
  type?: string
  transaction?: string
  ville?: string
  prix_min?: string
  prix_max?: string
  tri?: string
}): Promise<Bien[]> {
  const supabase = await createClient()

  let query = supabase
    .from('biens')
    .select('id, titre, type, transaction, prix, superficie, nb_chambres, quartier, ville, adresse, latitude, longitude, sponsorise_jusqu_a, telephone, whatsapp, statut, trust_score, photos_verified, availability_confirmed_at, created_at, biens_images(url, ordre), profiles(is_verified, type_compte)')
    .eq('publie', true)
    .order('sponsorise_jusqu_a', { ascending: false, nullsFirst: false })

  // Tri secondaire selon le paramètre
  switch (filtres?.tri) {
    case 'prix_asc':
      query = query.order('prix', { ascending: true })
      break
    case 'prix_desc':
      query = query.order('prix', { ascending: false })
      break
    case 'superficie':
      query = query.order('superficie', { ascending: false, nullsFirst: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  if (filtres?.type) query = query.eq('type', filtres.type)
  if (filtres?.transaction) query = query.eq('transaction', filtres.transaction)
  if (filtres?.ville) {
    query = query.or(`ville.ilike.%${filtres.ville}%,quartier.ilike.%${filtres.ville}%,adresse.ilike.%${filtres.ville}%`)
  }
  // Filtres de prix
  if (filtres?.prix_min && !isNaN(Number(filtres.prix_min))) {
    query = query.gte('prix', Number(filtres.prix_min))
  }
  if (filtres?.prix_max && !isNaN(Number(filtres.prix_max))) {
    query = query.lte('prix', Number(filtres.prix_max))
  }

  const { data: biens, error } = await query

  if (error) {
    console.error('Erreur searchBiensPubliques:', error)
    return []
  }

  return (biens || []).map((b) => {
    const images = Array.isArray(b.biens_images) ? [...b.biens_images] : []
    return {
      ...b,
      image_principale: images.length > 0 ? images.sort((a: any, c: any) => (a.ordre || 0) - (c.ordre || 0))[0].url : null,
    }
  }) as unknown as Bien[]
}


/**
 * Récupère un bien spécifique par son ID
 */
export async function getBienById(id: string): Promise<Bien | null> {
  const supabase = await createClient()
  const { data: bien, error } = await supabase
    .from('biens')
    .select('*, biens_images(url, ordre), profiles(is_verified, type_compte, nom)')
    .eq('id', id)
    .single()

  if (error || !bien) {
    console.error('Erreur getBienById:', error)
    return null
  }

  const images = Array.isArray(bien.biens_images) ? [...bien.biens_images] : []
  return {
    ...bien,
    biens_images: images.sort((a: any, c: any) => (a.ordre || 0) - (c.ordre || 0)),
  } as unknown as Bien
}
