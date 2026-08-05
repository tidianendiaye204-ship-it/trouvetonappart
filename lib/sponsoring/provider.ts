/**
 * Couche d'abstraction du Provider de Paiement (PSP).
 *
 * Architecture :
 *   IPaymentProvider (interface)
 *     └─ MockPaymentProvider   → dev / prod sans PSP réel
 *     └─ WavePaymentProvider   → à brancher (Wave Sénégal)
 *     └─ StripePaymentProvider → à brancher (Stripe)
 *
 * Pour changer de provider : définir PAYMENT_PROVIDER dans .env.local
 *   PAYMENT_PROVIDER=mock | wave | stripe
 */

import { MOCK_REF_PREFIX } from './config'

// ─── Types internes du provider ──────────────────────────────

export type InitiatePaymentInput = {
  transactionId: string
  montant: number          // en FCFA
  planJours: number
  bienTitre: string
  proprietaireId: string
  returnUrl: string        // URL de retour après paiement (confirmation)
}

export type InitiatePaymentResult =
  | {
      success: true
      reference: string        // Référence unique PSP
      redirectUrl: string | null  // null si paiement direct (mock)
      status: 'paid' | 'pending'  // 'paid' si confirmé immédiatement (mock)
    }
  | {
      success: false
      error: string
    }

export type VerifyPaymentResult =
  | { success: true; status: 'paid' | 'pending' | 'failed' }
  | { success: false; error: string }

// ─── Interface ───────────────────────────────────────────────

export interface IPaymentProvider {
  readonly name: string

  /**
   * Initie un paiement.
   * - En mode synchrone (mock) : retourne immédiatement avec status='paid'.
   * - En mode PSP (Wave, Stripe) : retourne une redirectUrl et status='pending'.
   */
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>

  /**
   * Vérifie le statut d'un paiement via sa référence PSP.
   * Utilisé pour la confirmation (webhook ou polling).
   */
  verify(reference: string): Promise<VerifyPaymentResult>
}

// ─── MockPaymentProvider ─────────────────────────────────────

/**
 * Provider de simulation — paiement confirmé instantanément.
 * Utile en développement et en production avant l'intégration d'un vrai PSP.
 *
 * Comportement :
 *   - initiate() → génère une référence unique et retourne status='paid'
 *   - verify()   → retourne toujours status='paid' (simulation)
 */
class MockPaymentProvider implements IPaymentProvider {
  readonly name = 'mock'

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    // Simuler une légère latence réseau (100-300ms)
    await new Promise((resolve) => setTimeout(resolve, 150))

    const reference = `${MOCK_REF_PREFIX}_${input.transactionId}_${crypto.randomUUID().slice(0, 8)}`

    console.log(`[MockPSP] Paiement initié — réf: ${reference}, montant: ${input.montant} FCFA`)

    return {
      success: true,
      reference,
      redirectUrl: null, // Pas de redirection en mode mock
      status: 'paid',    // Confirmation immédiate
    }
  }

  async verify(reference: string): Promise<VerifyPaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 50))

    if (!reference.startsWith(MOCK_REF_PREFIX)) {
      return { success: false, error: 'Référence mock invalide' }
    }

    return { success: true, status: 'paid' }
  }
}

// ─── Factory ─────────────────────────────────────────────────

/**
 * Retourne le provider actif selon PAYMENT_PROVIDER env var.
 * Étendre ici pour brancher un vrai PSP.
 *
 * @example
 * // .env.local
 * PAYMENT_PROVIDER=wave
 */
export function getPaymentProvider(): IPaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? 'mock'

  switch (provider) {
    case 'mock':
      return new MockPaymentProvider()

    // Placeholder Wave Sénégal — à implémenter
    case 'wave':
      console.warn('[PSP] Wave provider non encore implémenté. Fallback sur mock.')
      return new MockPaymentProvider()

    // Placeholder Orange Money — à implémenter
    case 'orange_money':
      console.warn('[PSP] Orange Money provider non encore implémenté. Fallback sur mock.')
      return new MockPaymentProvider()

    // Placeholder Stripe — à implémenter
    case 'stripe':
      console.warn('[PSP] Stripe provider non encore implémenté. Fallback sur mock.')
      return new MockPaymentProvider()

    default:
      console.warn(`[PSP] Provider inconnu "${provider}". Fallback sur mock.`)
      return new MockPaymentProvider()
  }
}
