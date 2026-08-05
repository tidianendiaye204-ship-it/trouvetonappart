// ============================================================================
// SERVICE GÉOCODAGE - ARCHITECTURE MULTI-FOURNISSEURS
// ============================================================================

export interface GeocodingResult {
  id: string
  latitude: number
  longitude: number
  adresse: string
  ville: string | null
  quartier: string | null
}

export interface IGeocodingProvider {
  search(query: string, limit?: number): Promise<GeocodingResult[]>
}

// ----------------------------------------------------------------------------
// 1. FOURNISSEURS (Providers)
// ----------------------------------------------------------------------------

/**
 * Provider Nominatim (OpenStreetMap)
 * Fournisseur gratuit, limité en requêtes, idéal pour le MVP.
 */
class NominatimProvider implements IGeocodingProvider {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search'
  
  async search(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    const params = new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      countrycodes: 'sn', // Restreindre au Sénégal
      q: query,
      limit: limit.toString()
    })

    const res = await fetch(`${this.baseUrl}?${params.toString()}`, {
      headers: {
        // Un User-Agent clair est OBLIGATOIRE pour Nominatim
        'User-Agent': 'TrouveTonAppartement/2.0 (contact@trouvetonappartement.sn)',
      },
      next: { revalidate: 3600 } // Cache au niveau du fetch Next.js (1 heure)
    })

    if (!res.ok) {
      throw new Error(`Nominatim API Error: ${res.status}`)
    }

    const data = await res.json()
    
    return data.map((place: any): GeocodingResult => {
      const addr = place.address || {}
      return {
        id: place.place_id.toString(),
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        adresse: place.display_name,
        ville: addr.city || addr.town || addr.village || null,
        quartier: addr.suburb || addr.neighbourhood || null
      }
    })
  }
}

// ----------------------------------------------------------------------------
// 2. SYSTÈME DE CACHE (Simple Memory LRU)
// ----------------------------------------------------------------------------

class SimpleLRUCache<K, V> {
  private maxItems: number
  private cache: Map<K, V>

  constructor(maxItems: number = 500) {
    this.maxItems = maxItems
    this.cache = new Map()
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined
    // Rafraîchir la position (récent)
    const val = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, val)
    return val
  }

  set(key: K, value: V) {
    if (this.cache.size >= this.maxItems) {
      // Supprimer le plus ancien (le premier élément de la Map)
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
}

// ----------------------------------------------------------------------------
// 3. LE SERVICE ORCHESTRATEUR
// ----------------------------------------------------------------------------

export class GeocodingService {
  private provider: IGeocodingProvider
  private cache: SimpleLRUCache<string, GeocodingResult[]>

  constructor() {
    // Par défaut, on utilise Nominatim. 
    // Pour migrer vers Google Maps, il suffit de changer cette ligne :
    // this.provider = process.env.GOOGLE_MAPS_KEY ? new GoogleMapsProvider() : new NominatimProvider()
    this.provider = new NominatimProvider()
    
    // Cache en mémoire partagée (utile entre plusieurs appels de la même instance serveur)
    this.cache = new SimpleLRUCache<string, GeocodingResult[]>(200)
  }

  async search(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    const normalizedQuery = query.trim().toLowerCase()
    
    if (normalizedQuery.length < 3) return []

    // 1. Check du cache
    const cachedResult = this.cache.get(normalizedQuery)
    if (cachedResult) {
      console.log(`[Geocoding] Cache HIT pour "${normalizedQuery}"`)
      return cachedResult
    }

    // 2. Appel externe
    console.log(`[Geocoding] Fetching provider pour "${normalizedQuery}"...`)
    const results = await this.provider.search(normalizedQuery, limit)

    // 3. Mise en cache
    this.cache.set(normalizedQuery, results)

    return results
  }
}

// Instance Singleton pour toute l'application
export const geocoder = new GeocodingService()
