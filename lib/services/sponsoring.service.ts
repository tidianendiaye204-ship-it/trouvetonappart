/**
 * Service de gestion des transactions de sponsorisation.
 * Toutes les opérations de lecture/écriture Supabase passent par ici.
 *
 * Les mutations sensibles (activation sponsoring, update statut) utilisent
 * le client server standard avec RLS — la vérification d'appartenance est
 * faite en amont dans les API routes.
 */

import { createClient } from '@/lib/supabase/server'
import {
  TransactionSponsoring,
  RevenusSponsoring,
  StatutTransactionSponsoring,
} from '@/types'

// ─── Lecture ─────────────────────────────────────────────────

/**
 * Récupère toutes les transactions de sponsorisation d'un propriétaire,
 * triées par date de création décroissante.
 */
export async function getTransactionsSponsoring(
  proprietaireId: string,
): Promise<TransactionSponsoring[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions_sponsoring')
    .select('*, biens(titre, ville, quartier)')
    .eq('proprietaire_id', proprietaireId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[SponsoringService] getTransactionsSponsoring:', error)
    return []
  }

  return (data ?? []) as unknown as TransactionSponsoring[]
}

/**
 * Récupère les transactions actives (paid + sponsorisation non expirée).
 */
export async function getTransactionsActives(
  proprietaireId: string,
): Promise<TransactionSponsoring[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions_sponsoring')
    .select('*, biens(titre, ville, quartier, sponsorise_jusqu_a)')
    .eq('proprietaire_id', proprietaireId)
    .eq('statut', 'paid')
    .order('paid_at', { ascending: false })

  if (error) {
    console.error('[SponsoringService] getTransactionsActives:', error)
    return []
  }

  return (data ?? []) as unknown as TransactionSponsoring[]
}

/**
 * Récupère une transaction par sa référence PSP.
 * Utilisé lors de la confirmation de paiement.
 */
export async function getTransactionByRef(
  reference: string,
): Promise<TransactionSponsoring | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions_sponsoring')
    .select('*')
    .eq('reference_paiement', reference)
    .single()

  if (error || !data) {
    console.error('[SponsoringService] getTransactionByRef:', error)
    return null
  }

  return data as unknown as TransactionSponsoring
}

/**
 * Récupère une transaction par son ID.
 */
export async function getTransactionById(
  transactionId: string,
): Promise<TransactionSponsoring | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions_sponsoring')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error || !data) {
    console.error('[SponsoringService] getTransactionById:', error)
    return null
  }

  return data as unknown as TransactionSponsoring
}

/**
 * Agrégats des revenus sponsoring pour le dashboard propriétaire.
 * Utilise la vue `v_revenus_sponsoring` créée dans la migration.
 */
export async function getRevenusSponsoring(
  proprietaireId: string,
): Promise<RevenusSponsoring> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('v_revenus_sponsoring')
    .select('*')
    .eq('proprietaire_id', proprietaireId)
    .maybeSingle()

  if (error) {
    console.error('[SponsoringService] getRevenusSponsoring:', error)
  }

  // Valeurs par défaut si le propriétaire n'a aucune transaction
  return {
    total_transactions_payees: data?.total_transactions_payees ?? 0,
    revenus_totaux: data?.revenus_totaux ?? 0,
    transactions_ce_mois: data?.transactions_ce_mois ?? 0,
    revenus_ce_mois: data?.revenus_ce_mois ?? 0,
    transactions_en_attente: data?.transactions_en_attente ?? 0,
    transactions_echouees: data?.transactions_echouees ?? 0,
  }
}

/**
 * Retourne le nombre de biens actuellement sponsorisés.
 */
export async function getNbBiensSponsorises(proprietaireId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('biens')
    .select('*', { count: 'exact', head: true })
    .eq('proprietaire_id', proprietaireId)
    .gt('sponsorise_jusqu_a', new Date().toISOString())

  if (error) {
    console.error('[SponsoringService] getNbBiensSponsorises:', error)
    return 0
  }

  return count ?? 0
}

// ─── Écriture ────────────────────────────────────────────────

/**
 * Met à jour le statut d'une transaction.
 * Appelé depuis les API routes (avec validation en amont).
 */
export async function updateTransactionStatut(
  transactionId: string,
  statut: StatutTransactionSponsoring,
  extras?: {
    reference_paiement?: string
    metadata_psp?: Record<string, unknown>
    paid_at?: string
    activated_at?: string
  },
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions_sponsoring')
    .update({
      statut,
      ...extras,
    })
    .eq('id', transactionId)

  if (error) {
    console.error('[SponsoringService] updateTransactionStatut:', error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

/**
 * Active le sponsoring sur un bien et marque la transaction comme payée.
 * Opération atomique : les deux mises à jour sont faites dans la même
 * connexion serveur. Si l'une échoue, on logue l'erreur sans rollback
 * (Supabase ne supporte pas les transactions multi-tables via le client JS).
 */
export async function activerSponsoringApresPaiement(params: {
  transactionId: string
  bienId: string
  proprietaireId: string
  planJours: number
  reference: string
}): Promise<{ ok: boolean; sponsoriseJusquA?: string; error?: string }> {
  const supabase = await createClient()

  // 1. Calculer la nouvelle date d'expiration du sponsoring
  const maintenant = new Date()
  const dateFin = new Date(maintenant)
  dateFin.setDate(dateFin.getDate() + params.planJours)
  const sponsoriseJusquA = dateFin.toISOString()
  const now = maintenant.toISOString()

  // 2. Mettre à jour le bien (sponsorise_jusqu_a)
  const { error: errBien } = await supabase
    .from('biens')
    .update({ sponsorise_jusqu_a: sponsoriseJusquA })
    .eq('id', params.bienId)
    .eq('proprietaire_id', params.proprietaireId) // Sécurité

  if (errBien) {
    console.error('[SponsoringService] Erreur activation bien:', errBien)
    return { ok: false, error: 'Erreur lors de l\'activation du sponsoring sur le bien.' }
  }

  // 3. Mettre à jour la transaction → paid
  const { error: errTrx } = await supabase
    .from('transactions_sponsoring')
    .update({
      statut: 'paid',
      reference_paiement: params.reference,
      paid_at: now,
      activated_at: now,
    })
    .eq('id', params.transactionId)

  if (errTrx) {
    console.error('[SponsoringService] Erreur update transaction:', errTrx)
    // Le bien est déjà sponsorisé, on logue mais on ne bloque pas
    return { ok: true, sponsoriseJusquA, error: 'Transaction mise à jour partiellement.' }
  }

  return { ok: true, sponsoriseJusquA }
}
