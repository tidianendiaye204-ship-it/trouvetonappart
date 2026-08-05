'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS_SPONSORING, formatMontant } from '@/lib/sponsoring/config'
import { PlanSponsoring } from '@/types'
import { Check, ShieldAlert, Loader2 } from 'lucide-react'

export default function CheckoutSponsoring({ bienId }: { bienId: string }) {
  const router = useRouter()
  const [selectedJours, setSelectedJours] = useState<PlanSponsoring>(14) // Défaut: 14 jours (Populaire)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePaiement = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/sponsoring/initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bienId, planJours: selectedJours }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement.')
      }

      // Si le paiement nécessite une redirection PSP (ex: Wave)
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
        return // On ne remet pas isSubmitting à false pour éviter un flash
      }

      // Paiement immédiat (mock)
      if (data.statut === 'paid') {
        router.push(`/mes-annonces/${bienId}/sponsoriser/confirmation?statut=success&planJours=${selectedJours}`)
        return
      }

      // Cas non géré
      throw new Error('Réponse inattendue du serveur de paiement.')

    } catch (err: any) {
      console.error('Erreur de paiement:', err)
      setError(err.message || 'Une erreur inattendue est survenue.')
      setIsSubmitting(false)
    }
  }

  const selectedPlan = PLANS_SPONSORING.find((p) => p.jours === selectedJours)!

  return (
    <div className="space-y-12">
      {/* Grille de sélection des plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS_SPONSORING.map((plan) => (
          <div
            key={plan.jours}
            onClick={() => setSelectedJours(plan.jours as PlanSponsoring)}
            className={`
              relative cursor-pointer rounded-3xl p-6 transition-all duration-300
              border-2 flex flex-col h-full
              ${selectedJours === plan.jours 
                ? 'border-indigo-principal bg-indigo-principal/5 shadow-xl scale-105 z-10' 
                : 'border-ardoise-gris/20 bg-white hover:border-indigo-principal/30 hover:shadow-md'
              }
            `}
          >
            {/* Badges promo */}
            {plan.badge && (
              <div className={`
                absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider
                ${plan.populaire ? 'bg-safran-accent text-quasi-noir shadow-md' : 'bg-quasi-noir text-white'}
              `}>
                {plan.badge}
              </div>
            )}

            <div className="text-center mb-6 pt-2">
              <h3 className="font-display text-2xl font-black text-quasi-noir mb-2">{plan.label}</h3>
              <p className="text-sm text-ardoise-gris h-10">{plan.description}</p>
            </div>

            <div className="text-center mb-6">
              <span className="font-display text-4xl font-black text-indigo-principal">
                {formatMontant(plan.montant).replace('FCFA', '')}
              </span>
              <span className="text-sm font-bold text-ardoise-gris ml-1">FCFA</span>
            </div>

            <div className="mt-auto">
              <div className={`
                flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm transition-colors
                ${selectedJours === plan.jours 
                  ? 'bg-indigo-principal text-white' 
                  : 'bg-sable-fond text-ardoise-gris group-hover:bg-ardoise-gris/10'
                }
              `}>
                {selectedJours === plan.jours ? (
                  <>
                    <Check className="w-5 h-5" /> Sélectionné
                  </>
                ) : (
                  'Choisir ce plan'
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zone de paiement / Checkout */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-ardoise-gris/10 max-w-2xl mx-auto">
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-1">Total à payer</p>
            <p className="font-display text-4xl font-black text-quasi-noir">
              {formatMontant(selectedPlan.montant)}
            </p>
            <p className="text-sm text-ardoise-gris mt-2">
              Mise en avant pour <strong className="text-quasi-noir">{selectedPlan.label}</strong>
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <button
              onClick={handlePaiement}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-safran-accent hover:brightness-105 text-quasi-noir px-10 py-4 font-black shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  Continuer vers le paiement
                </>
              )}
            </button>
            <p className="text-xs text-center text-ardoise-gris mt-3 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Paiement sécurisé
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
