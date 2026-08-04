import { NextResponse } from 'next/server'

// AVERTISSEMENT : La politique d'usage publique de Nominatim (OpenStreetMap) déconseille
// l'utilisation de leur API gratuite pour de l'autocomplete en temps réel.
// Si ce projet grandit et le volume de requêtes augmente, il faudra migrer vers :
// - Une instance Nominatim auto-hébergée
// - Ou un fournisseur de géocodage professionnel (LocationIQ, Mapbox Geocoding, Photon, Google Maps, etc.)
// pour éviter d'être bloqué et de surcharger le serveur public gratuit.

// (import removed)

// Simple in-memory rate limiter for the MVP
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const RATE_LIMIT = 15 // max requests
const WINDOW_MS = 60 * 1000 // per 1 minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record) {
        rateLimitMap.set(ip, { count: 1, lastReset: now })
        return true
    }

    if (now - record.lastReset > WINDOW_MS) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, lastReset: now })
        return true
    }

    if (record.count >= RATE_LIMIT) {
        return false // Rate limit exceeded
    }

    record.count += 1
    return true
}

export async function GET(request: Request) {
    // Obtenir l'IP (généralement via x-forwarded-for en production sur Vercel/Render)
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    
    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: 'Trop de requêtes. Veuillez patienter.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 3) {
        return NextResponse.json([])
    }

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=sn&q=${encodeURIComponent(q)}`,
            {
                headers: {
                    'User-Agent': 'TrouveTonAppartement/1.0 (contact: contact@trouvetonappartement.com)',
                },
            }
        )

        if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`)
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Erreur lors de la requête Nominatim:', error)
        return NextResponse.json({ error: 'Erreur lors de la récupération des adresses' }, { status: 500 })
    }
}
