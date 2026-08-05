import { NextRequest, NextResponse } from 'next/server'
import { IPaymentProvider, getPaymentProvider } from '@/lib/sponsoring/provider'
import { getTransactionLoyerById, confirmerPaiementLoyer, updateTransactionLoyerStatut } from '@/lib/services/loyer.service'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.redirect(new URL('/?error=missing_transaction', request.url))
    }

    // 1. Récupérer la transaction via admin client
    const transaction = await getTransactionLoyerById(transactionId)

    if (!transaction) {
      return NextResponse.redirect(new URL('/?error=transaction_not_found', request.url))
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    const successUrl = `${baseUrl}/paiement-loyer/${transaction.paiement_id}/confirmation?statut=success`
    const errorUrl = `${baseUrl}/paiement-loyer/${transaction.paiement_id}/confirmation?statut=failed`

    // Déjà payée ? (Pour éviter le double traitement si le webhook est passé avant)
    if (transaction.statut === 'paid') {
      return NextResponse.redirect(new URL(successUrl))
    }

    // 2. Vérifier le statut réel auprès du PSP
    const provider: IPaymentProvider = getPaymentProvider()
    
    // Si on a déjà une référence PSP, on vérifie. Sinon on se base sur l'ID interne (cas du mock).
    const referenceToCheck = transaction.reference_paiement || transaction.id
    
    const statusResult = await provider.verify(referenceToCheck)

    // 3. Traiter le résultat
    if (statusResult.success && statusResult.status === 'paid') {
      const confirmResult = await confirmerPaiementLoyer({
        transactionId: transaction.id,
        paiementId: transaction.paiement_id,
        reference: referenceToCheck,
      })

      if (!confirmResult.ok) {
        return NextResponse.redirect(new URL(`${errorUrl}&raison=internal_error`))
      }

      // Invalider le cache pour le propriétaire
      revalidatePath(`/baux/${transaction.bail_id}`)
      revalidatePath('/baux')
      
      return NextResponse.redirect(new URL(successUrl))
    } 
    
    if (statusResult.success && statusResult.status === 'failed') {
      await updateTransactionLoyerStatut(transaction.id, statusResult.status)
      return NextResponse.redirect(new URL(`${errorUrl}&raison=${statusResult.status}`))
    }

    // Si pending, on redirige vers une page d'attente
    return NextResponse.redirect(new URL(`${baseUrl}/paiement-loyer/${transaction.paiement_id}/confirmation?statut=pending`))

  } catch (err) {
    console.error('[/api/loyer/confirmer] Erreur serveur:', err)
    return NextResponse.redirect(new URL('/?error=internal_server_error', request.url))
  }
}

