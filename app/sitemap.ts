import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trouvetonappartement.sn'
  const supabase = await createClient()

  // 1. Pages statiques / de base
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/recherche`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  // 2. Villes cibles (Hubs locaux SEO)
  const villesCibles = ['keur-massar', 'ndioum', 'kounoune', 'dakar', 'saint-louis']
  
  villesCibles.forEach((ville) => {
    routes.push({
      url: `${baseUrl}/immobilier/${ville}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  // 3. Annonces dynamiques
  try {
    const { data: biens } = await supabase
      .from('biens')
      .select('id, updated_at')
      .eq('publie', true)
      .eq('statut_moderation', 'valide')
      .order('updated_at', { ascending: false })
      .limit(1000) // On limite pour éviter de casser la mémoire. Pour de très grands sites, utiliser generateSitemaps (sitemaps multiples)

    if (biens) {
      biens.forEach((bien) => {
        routes.push({
          url: `${baseUrl}/annonce/${bien.id}`,
          lastModified: new Date(bien.updated_at || new Date()),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      })
    }
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap des biens:', error)
  }

  return routes
}
