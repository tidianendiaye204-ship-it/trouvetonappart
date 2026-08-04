'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function FormBail({ biens, locataires }: { biens: any[], locataires: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const bien_id = formData.get('bien_id') as string
      const locataire_id = formData.get('locataire_id') as string
      const date_debut = formData.get('date_debut') as string
      const date_fin = formData.get('date_fin') as string
      const loyer_mensuel = formData.get('loyer_mensuel') as string

      if (!bien_id || !locataire_id || !date_debut || !loyer_mensuel) {
        throw new Error("Veuillez remplir tous les champs obligatoires.")
      }

      const { error: insertError } = await supabase
        .from('baux')
        .insert({
          bien_id,
          locataire_id,
          date_debut,
          date_fin: date_fin || null,
          loyer_mensuel: parseFloat(loyer_mensuel),
          statut: 'actif'
        })

      if (insertError) throw insertError

      router.push('/baux')
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement.")
      setLoading(false)
    }
  }

  if (biens.length === 0) {
    return (
      <div className="bg-safran-accent/10 text-safran-accent p-6 rounded-2xl border border-safran-accent/20 mb-6 font-medium">
        Vous devez d'abord créer un bien immobilier avant de pouvoir établir un contrat de location.
      </div>
    )
  }

  if (locataires.length === 0) {
    return (
      <div className="bg-safran-accent/10 text-safran-accent p-6 rounded-2xl border border-safran-accent/20 mb-6 font-medium">
        Vous devez d'abord ajouter un locataire à votre répertoire avant de pouvoir établir un contrat.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm p-6 sm:p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="bien_id" className="block text-sm font-medium text-quasi-noir mb-1.5">Sélectionner le bien *</label>
            <select id="bien_id" name="bien_id" required className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all">
              <option value="">-- Choisir un bien --</option>
              {biens.map(b => (
                <option key={b.id} value={b.id}>{b.titre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="locataire_id" className="block text-sm font-medium text-quasi-noir mb-1.5">Sélectionner le locataire *</label>
            <select id="locataire_id" name="locataire_id" required className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all">
              <option value="">-- Choisir un locataire --</option>
              {locataires.map(l => (
                <option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="loyer_mensuel" className="block text-sm font-medium text-quasi-noir mb-1.5">Loyer mensuel (CFA) *</label>
            <input type="number" id="loyer_mensuel" name="loyer_mensuel" min="0" required className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50" placeholder="Ex: 150000" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date_debut" className="block text-sm font-medium text-quasi-noir mb-1.5">Date de début *</label>
            <input type="date" id="date_debut" name="date_debut" required className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all" />
          </div>
          <div>
            <label htmlFor="date_fin" className="block text-sm font-medium text-quasi-noir mb-1.5">Date de fin (Optionnel)</label>
            <input type="date" id="date_fin" name="date_fin" className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all" />
            <p className="text-xs text-ardoise-gris mt-1.5">Laissez vide pour un contrat à durée indéterminée.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-principal text-white px-8 py-3 rounded-full font-bold hover:brightness-110 transition-all active:scale-95 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Créer le contrat
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
