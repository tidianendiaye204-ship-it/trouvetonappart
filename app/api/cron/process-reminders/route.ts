import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notificationService } from '@/lib/services/notifications'

// On utilise le service_role car ce script tourne en tâche de fond (CRON)
// et doit pouvoir lire toutes les données sans restriction RLS.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // CLE SECRETE !
)

export async function GET(request: Request) {
  // Optionnel: Ajouter une vérification de token d'autorisation pour empêcher
  // que n'importe qui sur internet puisse déclencher le CRON manuellement.
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { processed: 0, sent: 0, errors: 0 }

  try {
    // ==========================================
    // 1. RELANCES CRM (Leads)
    // ==========================================
    
    // Trouver les demandes dont la date de relance est dépassée
    const { data: leads } = await supabaseAdmin
      .from('contacts_demandes')
      .select('id, nom_demandeur, telephone_demandeur, prochaine_relance, statut, biens!inner(titre, proprietaire_id)')
      .lte('prochaine_relance', new Date().toISOString())
      .not('statut', 'in', '("converti","perdu")')

    if (leads) {
      for (const lead of leads) {
        // Supabase types might infer 1-to-many as an array even if it's many-to-one
        const propId = Array.isArray(lead.biens) ? lead.biens[0].proprietaire_id : (lead.biens as any).proprietaire_id
        const bienTitre = Array.isArray(lead.biens) ? lead.biens[0].titre : (lead.biens as any).titre
        
        // Vérifier les préférences
        const { data: pref } = await supabaseAdmin
          .from('automations_preferences')
          .select('relance_lead_whatsapp, relance_lead_email')
          .eq('profil_id', propId)
          .single()

        if (!pref) continue // Pas de préférences configurées

        const channels: ('whatsapp' | 'email')[] = []
        if (pref.relance_lead_whatsapp) channels.push('whatsapp')
        if (pref.relance_lead_email) channels.push('email')

        for (const channel of channels) {
          // PROTECTION ANTI-SPAM (Idempotence)
          // On vérifie si on n'a pas DÉJÀ envoyé un rappel pour cette demande aujourd'hui
          const today = new Date().toISOString().split('T')[0]
          const { data: historyExists } = await supabaseAdmin
            .from('automations_history')
            .select('id')
            .eq('entity_id', lead.id)
            .eq('trigger_type', 'lead_relance')
            .eq('channel', channel)
            .gte('created_at', today) // Pas de doublon le même jour
            .single()

          if (historyExists) continue // Déjà envoyé

          // Chercher un template personnalisé (sinon utiliser un défaut)
          const { data: template } = await supabaseAdmin
            .from('automations_templates')
            .select('content, subject')
            .eq('profil_id', propId)
            .eq('trigger_type', 'lead_relance')
            .eq('channel', channel)
            .single()

          const content = template 
            ? template.content.replace('{{nom}}', lead.nom_demandeur).replace('{{bien}}', bienTitre)
            : `Rappel automatique: Vous devez relancer ${lead.nom_demandeur} pour le bien "${bienTitre}".`

          // Envoi
          const response = await notificationService.notify(channel, {
            recipient: lead.telephone_demandeur, // En vrai, dépend du channel
            subject: template?.subject || 'Relance CRM',
            content
          })

          // Enregistrement dans l'historique
          await supabaseAdmin.from('automations_history').insert({
            profil_id: propId,
            trigger_type: 'lead_relance',
            channel,
            entity_id: lead.id,
            recipient: lead.telephone_demandeur,
            content_sent: content,
            status: response.success ? 'sent' : 'failed',
            error_log: response.error
          })

          results.processed++
          if (response.success) results.sent++
          else results.errors++
        }
      }
    }

    // ==========================================
    // 2. LOYERS EN RETARD (Structure exemple)
    // ==========================================
    /*
    const { data: retards } = await supabaseAdmin
      .from('paiements')
      .select('id, locataire_id, montant, date_echeance, statut, locataires!inner(nom, telephone, profils!inner(id))')
      .eq('statut', 'impaye')
      .lt('date_echeance', new Date().toISOString())
      
    // Logique similaire de vérification anti-spam et d'envoi...
    */

    return NextResponse.json({ success: true, results })

  } catch (error: any) {
    console.error('CRON Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
