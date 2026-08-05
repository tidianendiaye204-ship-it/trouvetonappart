import { NextRequest, NextResponse } from 'next/server'
import { getTransactionLoyerByRef, confirmerPaiementLoyer, updateTransactionLoyerStatut } from '@/lib/services/loyer.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // --- STUB START ---
    // À adapter selon le PSP réel (Wave, Orange Money, etc.)
    const reference = body?.reference
    const status = body?.status // 'paid' | 'failed'
    // --- STUB END ---

    if (!reference) {
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 })
    }

    const transaction = await getTransactionLoyerByRef(reference)

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    if (transaction.statut !== 'pending') {
      return NextResponse.json({ message: 'Déjà traitée' }, { status: 200 })
    }

    if (status === 'paid') {
      const result = await confirmerPaiementLoyer({
        transactionId: transaction.id,
        paiementId: transaction.paiement_id,
        reference: reference,
      })

      if (!result.ok) {
        return NextResponse.json({ error: 'Erreur interne validation' }, { status: 500 })
      }
    } else if (status === 'failed') {
      await updateTransactionLoyerStatut(transaction.id, 'failed')
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[/api/loyer/webhook] Erreur:', err)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
