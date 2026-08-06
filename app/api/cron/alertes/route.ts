import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  // Optionnel : Sécuriser la route cron avec un header secret Vercel
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // 1. Récupérer toutes les alertes actives
    const { data: alertes, error: alertesError } = await supabaseAdmin
      .from('alertes_recherche')
      .select('*')
      .eq('is_active', true)

    if (alertesError) throw alertesError
    if (!alertes || alertes.length === 0) return NextResponse.json({ message: 'Aucune alerte active' })

    // 2. Récupérer les biens récents (créés dans les dernières 24h par exemple, ou plus récents que le plus vieux last_notified_at)
    // Pour simplifier, on prend les biens créés depuis hier
    const hier = new Date()
    hier.setDate(hier.getDate() - 1)
    
    const { data: biens, error: biensError } = await supabaseAdmin
      .from('biens')
      .select('*')
      .eq('statut', 'disponible')
      .gte('created_at', hier.toISOString())

    if (biensError) throw biensError
    if (!biens || biens.length === 0) return NextResponse.json({ message: 'Aucun nouveau bien' })

    let emailsEnvoyes = 0

    // 3. Matcher les biens avec les alertes
    for (const alerte of alertes) {
      // Filtrer les biens qui correspondent aux critères de l'alerte
      const matchs = biens.filter(bien => {
        // Le bien doit être plus récent que la dernière notification de cette alerte
        if (new Date(bien.created_at) <= new Date(alerte.last_notified_at)) return false

        if (alerte.type && bien.type !== alerte.type) return false
        if (alerte.transaction && bien.transaction !== alerte.transaction) return false
        if (alerte.ville && bien.ville !== alerte.ville) return false
        if (alerte.prix_max && bien.prix > alerte.prix_max) return false
        
        return true
      })

      if (matchs.length > 0) {
        // TODO: Intégrer Resend, SendGrid ou un autre service d'emailing ici
        console.log(`📧 Envoi de ${matchs.length} nouveaux biens à ${alerte.email}`)
        console.log(`Biens matchés:`, matchs.map(b => b.titre))
        
        // Mettre à jour last_notified_at
        await supabaseAdmin
          .from('alertes_recherche')
          .update({ last_notified_at: new Date().toISOString() })
          .eq('id', alerte.id)
          
        emailsEnvoyes++
      }
    }

    return NextResponse.json({ 
      message: 'Cron terminé', 
      alertesTraitees: alertes.length, 
      emailsEnvoyes 
    })

  } catch (error) {
    console.error('Erreur Cron Alertes:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
