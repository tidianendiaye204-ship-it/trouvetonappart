import { PlanSponsoringConfig } from '@/types'

/**
 * Plans de sponsorisation disponibles.
 * Source unique de vérité — modifier ici pour changer les prix.
 * Les montants sont en FCFA (Franc CFA).
 */
export const PLANS_SPONSORING: PlanSponsoringConfig[] = [
  {
    jours: 7,
    montant: 2500,
    label: '7 jours',
    description: 'Idéal pour tester la mise en avant',
    badge: 'Découverte',
  },
  {
    jours: 14,
    montant: 4500,
    label: '14 jours',
    description: 'Le meilleur rapport qualité / durée',
    badge: 'Populaire',
    populaire: true,
  },
  {
    jours: 30,
    montant: 8900,
    label: '30 jours',
    description: 'Visibilité maximale sur un mois complet',
    badge: 'Meilleure valeur',
  },
]

/** Durée de vie d'une transaction pending (en minutes). */
export const TRANSACTION_TTL_MINUTES = 30

/** Délimiteur de référence pour les transactions mock. */
export const MOCK_REF_PREFIX = 'mock'

/**
 * Retourne la config d'un plan par sa durée.
 * Lève une erreur si le plan n'est pas trouvé (validation défensive).
 */
export function getPlanConfig(jours: number): PlanSponsoringConfig {
  const plan = PLANS_SPONSORING.find((p) => p.jours === jours)
  if (!plan) {
    throw new Error(`Plan de sponsorisation invalide : ${jours} jours`)
  }
  return plan
}

/**
 * Formate un montant en FCFA avec séparateurs français.
 * Ex : 8900 → "8 900 FCFA"
 */
export function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(montant)
}
