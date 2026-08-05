export type PlanName = 'gratuit' | 'solo' | 'pro' | 'business'

export type FeatureName = 
  | 'crm_basique' 
  | 'dossier_locataire' 
  | 'automatisation' 
  | 'paiement_en_ligne' 
  | 'sponsoring_inclus' 
  | 'marque_blanche'

export interface PlanDetails {
  name: PlanName
  displayName: string
  priceMonthly: number
  priceYearly: number
  maxBiens: number
  features: FeatureName[]
}

export const PLANS: Record<PlanName, PlanDetails> = {
  gratuit: {
    name: 'gratuit',
    displayName: 'Découverte',
    priceMonthly: 0,
    priceYearly: 0,
    maxBiens: 2,
    features: ['crm_basique']
  },
  solo: {
    name: 'solo',
    displayName: 'Indépendant',
    priceMonthly: 15000,
    priceYearly: 150000,
    maxBiens: 10,
    features: ['crm_basique', 'dossier_locataire']
  },
  pro: {
    name: 'pro',
    displayName: 'Agence Pro',
    priceMonthly: 35000,
    priceYearly: 350000,
    maxBiens: 50,
    features: ['crm_basique', 'dossier_locataire', 'automatisation', 'paiement_en_ligne', 'sponsoring_inclus']
  },
  business: {
    name: 'business',
    displayName: 'Réseau & Franchise',
    priceMonthly: 90000,
    priceYearly: 900000,
    maxBiens: -1, // Illimité
    features: ['crm_basique', 'dossier_locataire', 'automatisation', 'paiement_en_ligne', 'sponsoring_inclus', 'marque_blanche']
  }
}

/**
 * Vérifie si le plan possède une fonctionnalité spécifique
 */
export function hasFeature(planName: PlanName, feature: FeatureName): boolean {
  return PLANS[planName].features.includes(feature)
}

/**
 * Vérifie si le propriétaire a atteint la limite de biens pour son plan
 */
export function canAddBien(planName: PlanName, currentCount: number): boolean {
  const max = PLANS[planName].maxBiens
  if (max === -1) return true
  return currentCount < max
}
