/**
 * GET /api/sponsoring/confirmer?ref=<reference>&bienId=<bienId>
 *
 * Endpoint de confirmation de paiement.
 * Appelé après retour du PSP (redirect) ou depuis le polling côté client.
 *
 * En mode mock : la transaction est déjà 'paid' (gérée dans /initier).
 * En mode PSP async : vérifie le statut auprès du PSP et active si paid.
 *
 * Redirige vers la page de confirmation avec le statut en paramètre.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPaymentProvider } from '@/lib/sponsoring/provider'
import { activerSponsoringApresPaiement } from '@/lib/services/sponsoring.service'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const ref = searchParams.get('ref')
  const bienId = searchParams.get('bienId')
  const transactionId = searchParams.get('transactionId')

  const baseRedirect = bienId
    ? `${origin}/mes-annonces/${bienId}/sponsoriser/confirmation`
    : `${origin}/mes-annonces`

  // 1. Paramètres requis
  if (!ref && !transactionId) {
    return NextResponse.redirect(`${baseRedirect}?statut=failed&raison=params_manquants`)
  }

  try {
    // 2. Authentification
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(`${baseRedirect}?statut=failed&raison=non_authentifie`)
    }

    // 3. Chercher la transaction (par ref ou par id)
    let transaction
    if (ref) {
      const { data } = await supabase
        .from('transactions_sponsoring')
        .select('*')
        .eq('reference_paiement', ref)
        .eq('proprietaire_id', user.id)
        .single()
      transaction = data
    } else if (transactionId) {
      const { data } = await supabase
        .from('transactions_sponsoring')
        .select('*')
        .eq('id', transactionId)
        .eq('proprietaire_id', user.id)
        .single()
      transaction = data
    }

    if (!transaction) {
      return NextResponse.redirect(`${baseRedirect}?statut=failed&raison=transaction_introuvable`)
    }

    // 4. Transaction déjà payée (mode mock ou double appel)
    if (transaction.statut === 'paid') {
      // Revalider les caches
      revalidatePath('/mes-annonces')
      revalidatePath(`/annonce/${transaction.bien_id}`)
      revalidatePath('/')

      return NextResponse.redirect(
        `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=success&planJours=${transaction.plan_jours}`,
      )
    }

    // 5. Transaction expirée ou échouée
    if (transaction.statut === 'expired' || transaction.statut === 'failed') {
      return NextResponse.redirect(
        `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=${transaction.statut}`,
      )
    }

    // 6. Transaction pending → vérifier auprès du PSP (mode async)
    if (transaction.statut === 'pending') {
      // Vérifier expiration TTL
      if (new Date(transaction.expires_at) < new Date()) {
        await supabase
          .from('transactions_sponsoring')
          .update({ statut: 'expired' })
          .eq('id', transaction.id)

        return NextResponse.redirect(
          `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=expired`,
        )
      }

      // Interroger le PSP
      const provider = getPaymentProvider()
      const verif = await provider.verify(transaction.reference_paiement ?? '')

      if (!verif.success) {
        return NextResponse.redirect(
          `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=pending`,
        )
      }

      if (verif.status === 'paid') {
        // Activer le sponsoring
        const result = await activerSponsoringApresPaiement({
          transactionId: transaction.id,
          bienId: transaction.bien_id,
          proprietaireId: user.id,
          planJours: transaction.plan_jours,
          reference: transaction.reference_paiement ?? '',
        })

        if (result.ok) {
          revalidatePath('/mes-annonces')
          revalidatePath(`/annonce/${transaction.bien_id}`)
          revalidatePath('/')

          return NextResponse.redirect(
            `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=success&planJours=${transaction.plan_jours}`,
          )
        }

        return NextResponse.redirect(
          `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=failed&raison=activation_echouee`,
        )
      }

      if (verif.status === 'failed') {
        await supabase
          .from('transactions_sponsoring')
          .update({ statut: 'failed' })
          .eq('id', transaction.id)

        return NextResponse.redirect(
          `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=failed`,
        )
      }

      // Toujours pending
      return NextResponse.redirect(
        `${origin}/mes-annonces/${transaction.bien_id}/sponsoriser/confirmation?statut=pending`,
      )
    }

    return NextResponse.redirect(`${baseRedirect}?statut=failed&raison=statut_inconnu`)
  } catch (err) {
    console.error('[/api/sponsoring/confirmer] Erreur:', err)
    return NextResponse.redirect(`${baseRedirect}?statut=failed&raison=erreur_serveur`)
  }
}
