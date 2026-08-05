/**
 * Service de gestion des paiements de loyers en ligne.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { StatutTransactionLoyer, TransactionLoyer } from '@/types'

// ─── Lecture ─────────────────────────────────────────────────

export async function getTransactionLoyerByRef(
  reference: string,
): Promise<TransactionLoyer | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('transactions_loyers')
    .select('*')
    .eq('reference_paiement', reference)
    .single()

  if (error || !data) {
    console.error('[LoyerService] getTransactionLoyerByRef:', error)
    return null
  }

  return data as unknown as TransactionLoyer
}

export async function getTransactionLoyerById(
  transactionId: string,
): Promise<TransactionLoyer | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('transactions_loyers')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error || !data) {
    console.error('[LoyerService] getTransactionLoyerById:', error)
    return null
  }

  return data as unknown as TransactionLoyer
}

export async function getPendingTransactionForPaiement(
  paiementId: string,
): Promise<TransactionLoyer | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('transactions_loyers')
    .select('*')
    .eq('paiement_id', paiementId)
    .eq('statut', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error) {
    console.error('[LoyerService] getPendingTransactionForPaiement:', error)
    return null
  }

  return data as unknown as TransactionLoyer
}

// ─── Écriture ────────────────────────────────────────────────

export async function updateTransactionLoyerStatut(
  transactionId: string,
  statut: StatutTransactionLoyer,
  extras?: {
    reference_paiement?: string
    metadata_psp?: Record<string, unknown>
    paid_at?: string
  },
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('transactions_loyers')
    .update({
      statut,
      ...extras,
    })
    .eq('id', transactionId)

  if (error) {
    console.error('[LoyerService] updateTransactionLoyerStatut:', error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

/**
 * Confirme le paiement du loyer.
 * Opération atomique :
 * 1. Marque la transaction comme paid
 * 2. Marque l'échéance de loyer comme payée en ligne
 */
export async function confirmerPaiementLoyer(params: {
  transactionId: string
  paiementId: string
  reference: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // 1. Mettre à jour le paiement initial
  const { error: errPaiement } = await supabase
    .from('paiements')
    .update({ 
      statut: 'paye', 
      methode_paiement: 'en_ligne',
      date_paiement: now.split('T')[0] // Format YYYY-MM-DD
    })
    .eq('id', params.paiementId)

  if (errPaiement) {
    console.error('[LoyerService] Erreur maj paiement:', errPaiement)
    return { ok: false, error: 'Erreur lors de la validation de la quittance.' }
  }

  // 2. Mettre à jour la transaction -> paid
  const { error: errTrx } = await supabase
    .from('transactions_loyers')
    .update({
      statut: 'paid',
      reference_paiement: params.reference,
      paid_at: now,
    })
    .eq('id', params.transactionId)

  if (errTrx) {
    console.error('[LoyerService] Erreur update transaction:', errTrx)
    return { ok: true, error: 'Transaction mise à jour partiellement.' }
  }

  return { ok: true }
}
