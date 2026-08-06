'use client'

import { useState } from 'react'
import { Bell, X, CheckCircle2, Loader2 } from 'lucide-react'
import { createAlerte } from '@/app/actions/alertes'

type ModalAlerteProps = {
  type?: string
  transaction?: string
  ville?: string
  prix_max?: string
  onClose: () => void
}

export default function ModalAlerte({ type, transaction, ville, prix_max, onClose }: ModalAlerteProps) {
  const [enCours, setEnCours] = useState(false)
  const [envoye, setEnvoye] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setEnCours(true)
    setErreur(null)

    // On ajoute les filtres actuels au formulaire
    if (type) formData.append('type', type)
    if (transaction) formData.append('transaction', transaction)
    if (ville) formData.append('ville', ville)
    if (prix_max) formData.append('prix_max', prix_max)

    const result = await createAlerte(formData)
    setEnCours(false)

    if (!result.success) {
      setErreur(result.error || "Une erreur est survenue.")
    } else {
      setEnvoye(true)
      setTimeout(onClose, 3000)
    }
  }

  // Calcul du texte récapitulatif
  const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Biens'
  const transLabel = transaction === 'location' ? 'à louer' : transaction === 'vente' ? 'à vendre' : ''
  const villeLabel = ville ? `à ${ville}` : ''
  const prixLabel = prix_max ? `(Max ${parseInt(prix_max).toLocaleString('fr-FR')} FCFA)` : ''
  const resume = `${typeLabel} ${transLabel} ${villeLabel} ${prixLabel}`.trim() || 'Tous les biens'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-indigo-principal px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display font-black text-lg">Créer une alerte</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {envoye ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-black text-quasi-noir mb-2">Alerte créée !</h3>
              <p className="text-ardoise-gris text-sm">
                Vous recevrez un email dès qu&apos;un nouveau bien correspond à vos critères.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-sable-fond rounded-xl p-4 mb-6 border border-ardoise-gris/10">
                <p className="text-xs font-bold text-ardoise-gris uppercase mb-1">Vos critères actuels :</p>
                <p className="font-medium text-quasi-noir text-sm">{resume}</p>
              </div>

              <form action={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-quasi-noir mb-2">
                    Votre adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="exemple@email.com"
                    className="w-full bg-white border border-ardoise-gris/20 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-principal/30 focus:border-indigo-principal transition-all shadow-sm"
                  />
                </div>

                {erreur && (
                  <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{erreur}</p>
                )}

                <button
                  type="submit"
                  disabled={enCours}
                  className="w-full bg-indigo-principal text-white font-black text-sm rounded-xl py-3.5 mt-2 hover:brightness-110 disabled:opacity-50 transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
                >
                  {enCours ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Création...</>
                  ) : (
                    "M'alerter par email"
                  )}
                </button>
                <p className="text-center text-xs text-ardoise-gris/80 mt-3 font-medium">
                  Zéro spam. Désinscription en 1 clic.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
