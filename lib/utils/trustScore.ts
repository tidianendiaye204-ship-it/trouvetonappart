import { Bien, Profile } from '@/types'

/**
 * Calcule le score de confiance d'un bien (0 à 100).
 * Basé sur plusieurs critères de qualité et de vérification.
 */
export function calculerScoreConfiance(bien: Partial<Bien>, profil?: Partial<Profile>): number {
  let score = 0

  // 1. Photos (+20)
  if (bien.biens_images && bien.biens_images.length > 0) {
    score += 20
  }

  // 2. Prix renseigné et valide (+20)
  if (bien.prix && bien.prix > 0) {
    score += 20
  }

  // 3. Localisation renseignée (+20)
  if (bien.ville || bien.quartier) {
    score += 20
  }

  // 4. Profil vérifié (+30)
  if (profil && profil.is_verified) {
    score += 30
  }

  // 5. Fraîcheur ou disponibilité confirmée récemment (+10)
  const isRecent = bien.created_at && (new Date().getTime() - new Date(bien.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000
  const isAvailabilityConfirmed = bien.availability_confirmed_at && (new Date().getTime() - new Date(bien.availability_confirmed_at).getTime()) < 30 * 24 * 60 * 60 * 1000

  if (isRecent || isAvailabilityConfirmed) {
    score += 10
  }

  // Cap à 100 au cas où
  return Math.min(score, 100)
}
