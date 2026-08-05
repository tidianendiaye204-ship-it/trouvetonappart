import { NextResponse } from 'next/server'
import { geocoder } from '@/lib/services/geocoding'
import { checkRateLimit } from '@/lib/security'

export async function GET(request: Request) {
    // 1. Rate Limiting robuste (Sécurité)
    // On limite à 30 requêtes par minute (largement suffisant pour l'autocomplete avec debounce)
    const isAllowed = await checkRateLimit('geocode_search', 30, 60)
    
    if (!isAllowed) {
        return NextResponse.json(
            { error: 'Trop de requêtes. Veuillez patienter un instant.' }, 
            { status: 429 }
        )
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 3) {
        return NextResponse.json([])
    }

    try {
        // 2. Appel au service d'orchestration (qui gère le Cache et le Provider)
        const results = await geocoder.search(q, 5)
        
        return NextResponse.json(results)
    } catch (error) {
        console.error('Erreur lors du géocodage:', error)
        return NextResponse.json(
            { error: 'Service de géocodage temporairement indisponible' }, 
            { status: 503 } // 503 indique que le service tiers (Nominatim) est indisponible
        )
    }
}
