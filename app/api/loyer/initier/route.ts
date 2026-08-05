import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { IPaymentProvider, getPaymentProvider, InitiatePaymentInput } from '@/lib/sponsoring/provider'

export async function POST(request: NextRequest) {
  try {
    const { paiementId } = await request.json()

    if (!paiementId) {
      return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Vérifier l'échéance de loyer
    const { data: paiement, error: errPaiement } = await supabase
      .from('paiements')
      .select('*, baux(id, locataire_id, biens(proprietaire_id))')
      .eq('id', paiementId)
      .single()

    if (errPaiement || !paiement) {
      return NextResponse.json({ success: false, error: 'Paiement introuvable' }, { status: 404 })
    }

    if (paiement.statut === 'paye') {
      return NextResponse.json({ success: false, error: 'Ce loyer est déjà payé' }, { status: 400 })
    }

    const locataireId = paiement.baux?.locataire_id
    const proprietaireId = paiement.baux?.biens?.proprietaire_id
    const bailId = paiement.bail_id

    if (!locataireId || !proprietaireId) {
      return NextResponse.json({ success: false, error: 'Données incohérentes' }, { status: 500 })
    }

    // 2. Vérifier idempotence
    const { data: trxEnAttente } = await supabase
      .from('transactions_loyers')
      .select('id')
      .eq('paiement_id', paiementId)
      .eq('statut', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    let transactionId = trxEnAttente?.id

    // 3. Créer la transaction si nécessaire
    if (!transactionId) {
      const providerStr = process.env.PAYMENT_PROVIDER || 'mock'
      
      const { data: newTrx, error: errInsert } = await supabase
        .from('transactions_loyers')
        .insert({
          paiement_id: paiementId,
          bail_id: bailId,
          locataire_id: locataireId,
          proprietaire_id: proprietaireId,
          montant: paiement.montant,
          provider: providerStr,
          statut: 'pending'
        })
        .select('id')
        .single()

      if (errInsert || !newTrx) {
        console.error('Insert Error:', errInsert)
        return NextResponse.json({ success: false, error: 'Erreur lors de l\'initialisation' }, { status: 500 })
      }
      transactionId = newTrx.id
    }

    // 4. Appeler le Payment Provider
    const provider: IPaymentProvider = getPaymentProvider()
    
    // Construire l'URL de retour vers le checkout locataire
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    const returnUrl = `${baseUrl}/api/loyer/confirmer?transactionId=${transactionId}`

    const paymentRequest: InitiatePaymentInput = {
      transactionId,
      montant: paiement.montant,
      planJours: 0, // Inutilisé pour le loyer
      bienTitre: `Loyer ${paiement.mois}/${paiement.annee}`,
      proprietaireId: proprietaireId,
      returnUrl,
    }

    const result = await provider.initiate(paymentRequest)

    if (!result.success) {
      // Marquer la transaction comme failed
      await supabase.from('transactions_loyers').update({ statut: 'failed' }).eq('id', transactionId)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    // 5. Mettre à jour la transaction avec la référence PSP si fournie
    if (result.reference) {
      await supabase
        .from('transactions_loyers')
        .update({ reference_paiement: result.reference })
        .eq('id', transactionId)
    }

    return NextResponse.json({
      success: true,
      transactionId,
      redirectUrl: result.redirectUrl,
      statut: result.status || 'pending'
    })

  } catch (err: any) {
    console.error('[/api/loyer/initier] Error:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

