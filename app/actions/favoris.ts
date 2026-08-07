'use server'

import { createClient } from '@/lib/supabase/server'
import { Bien } from '@/types'

export async function fetchBiensByIds(ids: string[]): Promise<Bien[]> {
  if (!ids || ids.length === 0) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('biens')
    .select('*, biens_images(url, ordre), profiles(is_verified, type_compte)')
    .in('id', ids)

  if (error) {
    console.error('Error fetching favoris:', error)
    return []
  }

  const mappedData = data.map(b => {
    const images = Array.isArray(b.biens_images) ? [...b.biens_images] : []
    return {
      ...b,
      image_principale: images.length > 0 ? images.sort((a: any, c: any) => (a.ordre || 0) - (c.ordre || 0))[0].url : null,
    }
  })

  // Preserve the order of the ids
  const favorisMap = new Map(mappedData.map(bien => [bien.id, bien]))
  return ids.map(id => favorisMap.get(id)).filter(Boolean) as Bien[]
}
