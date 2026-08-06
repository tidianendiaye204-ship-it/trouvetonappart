'use server'

import { createClient } from '@/lib/supabase/server'
import { Bien } from '@/types'

export async function fetchBiensByIds(ids: string[]): Promise<Bien[]> {
  if (!ids || ids.length === 0) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('biens')
    .select('*')
    .in('id', ids)

  if (error) {
    console.error('Error fetching favoris:', error)
    return []
  }

  // Preserve the order of the ids
  const favorisMap = new Map(data.map(bien => [bien.id, bien]))
  return ids.map(id => favorisMap.get(id)).filter(Boolean) as Bien[]
}
