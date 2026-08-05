/**
 * POST /api/sponsoring/webhook
 * 
 * Endpoint générique pour recevoir les notifications asynchrones (webhooks)
 * des fournisseurs de paiement (Wave, Orange Money, PayDunya, etc.).
 * 
 * Ce fichier est un squelette à adapter lorsque vous intégrerez un vrai PSP.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { activerSponsoringApresPaiement } from '@/lib/services/sponsoring.service'

export async function POST(request: NextRequest) {
  try {
    // 1. Lire le body (format spécifique au PSP)
    const body = await request.json()
    
    // 2. Vérifier la signature du webhook (TRÈS IMPORTANT POUR LA SÉCURITÉ)
    // const signature = request.headers.get('x-psp-signature')
    // if (!verifySignature(body, signature, process.env.PSP_SECRET)) {
    //   return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    // }

    // 3. Extraire la référence et le statut selon le format du PSP
    // const reference = body.reference_paiement
    // const status = body.status === 'SUCCESS' ? 'paid' : 'failed'
    
    // --- STUB START ---
    const reference = body?.reference
    const status = body?.status
    // --- STUB END ---

    if (!reference) {
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 })
    }

    const supabase = await createClient()

    // 4. Retrouver la transaction correspondante
    const { data: transaction, error: trxError } = await supabase
      .from('transactions_sponsoring')
      .select('*')
      .eq('reference_paiement', reference)
      .single()

    if (trxError || !transaction) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    // Si déjà traitée, on retourne 200 pour dire au PSP d'arrêter d'appeler
    if (transaction.statut !== 'pending') {
      return NextResponse.json({ message: 'Déjà traitée' }, { status: 200 })
    }

    // 5. Mettre à jour la base de données selon le statut final
    if (status === 'paid') {
      const result = await activerSponsoringApresPaiement({
        transactionId: transaction.id,
        bienId: transaction.bien_id,
        proprietaireId: transaction.proprietaire_id,
        planJours: transaction.plan_jours,
        reference: reference,
      })

      if (!result.ok) {
        console.error('[Webhook] Erreur activation:', result.error)
        // On retourne 500 pour que le PSP réessaye plus tard
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
      }
    } else if (status === 'failed') {
      await supabase
        .from('transactions_sponsoring')
        .update({ statut: 'failed' })
        .eq('id', transaction.id)
    }

    // 6. Succès !
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[/api/sponsoring/webhook] Erreur:', err)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
