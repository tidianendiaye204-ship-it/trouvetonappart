'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Loader2, ArrowRight } from 'lucide-react'

export default function CheckoutLoyer({ paiementId, montant }: { paiementId: string, montant: number }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePaiement = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/loyer/initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paiementId }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement.')
      }

      // Si le paiement nécessite une redirection PSP (ex: Wave)
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
        return 
      }

      // Paiement immédiat (mock)
      if (data.statut === 'paid') {
        router.push(`/paiement-loyer/${paiementId}/confirmation?statut=success`)
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

  return (
    <div className="mt-8 border-t border-ardoise-gris/10 pt-8">
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handlePaiement}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-quasi-noir hover:brightness-125 text-white px-10 py-4 font-black shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connexion au partenaire...
          </>
        ) : (
          <>
            Procéder au paiement sécurisé <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
      
      <p className="text-xs text-center text-ardoise-gris mt-4 flex items-center justify-center gap-1">
        <ShieldAlert className="w-3 h-3" /> Vos données de paiement sont chiffrées de bout en bout
      </p>
    </div>
  )
}
