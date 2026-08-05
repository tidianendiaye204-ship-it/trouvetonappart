/**
 * POST /api/sponsoring/initier
 *
 * Crée une transaction de sponsorisation en état 'pending' et lance
 * le flux de paiement via le PSP configuré.
 *
 * Body attendu : { bienId: string, planJours: number }
 *
 * Réponse succès :
 *   { success: true, transactionId, redirectUrl? }
 *
 * Réponse erreur :
 *   { success: false, error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanConfig, TRANSACTION_TTL_MINUTES } from '@/lib/sponsoring/config'
import { getPaymentProvider } from '@/lib/sponsoring/provider'
import { z } from 'zod'

// ─── Validation du body ───────────────────────────────────────

const bodySchema = z.object({
  bienId: z.string().uuid({ message: 'bienId invalide' }),
  planJours: z.coerce.number().refine((v) => [7, 14, 30].includes(v), {
    message: 'planJours doit être 7, 14 ou 30',
  }),
})

// ─── Handler ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Authentification
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 },
      )
    }

    // 2. Validation du body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Body JSON invalide' },
        { status: 400 },
      )
    }

    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 },
      )
    }

    const { bienId, planJours } = parsed.data

    // 3. Vérifier que le bien appartient à l'utilisateur
    const { data: bien, error: bienError } = await supabase
      .from('biens')
      .select('id, titre, proprietaire_id')
      .eq('id', bienId)
      .eq('proprietaire_id', user.id)
      .single()

    if (bienError || !bien) {
      return NextResponse.json(
        { success: false, error: 'Bien introuvable ou non autorisé' },
        { status: 403 },
      )
    }

    // 4. Récupérer la config du plan
    let planConfig
    try {
      planConfig = getPlanConfig(planJours)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Plan de sponsorisation invalide' },
        { status: 400 },
      )
    }

    // 5. Créer la transaction 'pending' dans Supabase
    const expiresAt = new Date(Date.now() + TRANSACTION_TTL_MINUTES * 60 * 1000).toISOString()
    const provider = getPaymentProvider()

    const { data: transaction, error: trxError } = await supabase
      .from('transactions_sponsoring')
      .insert({
        bien_id: bienId,
        proprietaire_id: user.id,
        plan_jours: planJours,
        montant: planConfig.montant,
        statut: 'pending',
        provider: provider.name,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (trxError || !transaction) {
      console.error('[/api/sponsoring/initier] Erreur création transaction:', trxError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la transaction' },
        { status: 500 },
      )
    }

    // 6. Construire l'URL de retour (confirmation)
    const baseUrl = request.nextUrl.origin
    const returnUrl = `${baseUrl}/mes-annonces/${bienId}/sponsoriser/confirmation`

    // 7. Initier le paiement auprès du PSP
    const paiementResult = await provider.initiate({
      transactionId: transaction.id,
      montant: planConfig.montant,
      planJours,
      bienTitre: bien.titre,
      proprietaireId: user.id,
      returnUrl,
    })

    if (!paiementResult.success) {
      // Marquer la transaction comme failed
      await supabase
        .from('transactions_sponsoring')
        .update({ statut: 'failed' })
        .eq('id', transaction.id)

      return NextResponse.json(
        { success: false, error: paiementResult.error },
        { status: 502 },
      )
    }

    // 8. Si le PSP confirme immédiatement (mode mock) → activer le sponsoring
    if (paiementResult.status === 'paid') {
      const dateFin = new Date()
      dateFin.setDate(dateFin.getDate() + planJours)
      const now = new Date().toISOString()

      // Activer le bien
      await supabase
        .from('biens')
        .update({ sponsorise_jusqu_a: dateFin.toISOString() })
        .eq('id', bienId)
        .eq('proprietaire_id', user.id)

      // Confirmer la transaction
      await supabase
        .from('transactions_sponsoring')
        .update({
          statut: 'paid',
          reference_paiement: paiementResult.reference,
          paid_at: now,
          activated_at: now,
        })
        .eq('id', transaction.id)

      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        redirectUrl: null, // Pas de redirection, on gère côté client
        statut: 'paid',
        sponsoriseJusquA: dateFin.toISOString(),
      })
    }

    // 9. PSP async (Wave, etc.) → sauvegarder la référence, retourner redirectUrl
    await supabase
      .from('transactions_sponsoring')
      .update({ reference_paiement: paiementResult.reference })
      .eq('id', transaction.id)

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      redirectUrl: paiementResult.redirectUrl,
      statut: 'pending',
    })
  } catch (err) {
    console.error('[/api/sponsoring/initier] Erreur inattendue:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 },
    )
  }
}
