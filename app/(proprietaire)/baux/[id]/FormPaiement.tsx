'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, Loader2 } from 'lucide-react'

export default function FormPaiement({ bailId, loyerMensuel }: { bailId: string, loyerMensuel: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const moisActuel = new Date().getMonth() + 1
  const anneeActuelle = new Date().getFullYear()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    
    try {
      const mois = parseInt(formData.get('mois') as string)
      const annee = parseInt(formData.get('annee') as string)
      const montant = parseFloat(formData.get('montant') as string)
      const statut = formData.get('statut') as string
      const date_paiement = statut === 'paye' ? new Date().toISOString() : null

      const { error: insertError } = await supabase
        .from('paiements')
        .insert({
          bail_id: bailId,
          mois,
          annee,
          montant,
          statut,
          date_paiement
        })

      if (insertError) throw insertError

      form.reset()
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-ardoise-gris/10 p-6 shadow-sm">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-quasi-noir mb-1.5">Mois</label>
            <select name="mois" defaultValue={moisActuel} className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl text-sm focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all">
              <option value="1">Janvier</option>
              <option value="2">Février</option>
              <option value="3">Mars</option>
              <option value="4">Avril</option>
              <option value="5">Mai</option>
              <option value="6">Juin</option>
              <option value="7">Juillet</option>
              <option value="8">Août</option>
              <option value="9">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-quasi-noir mb-1.5">Année</label>
            <input type="number" name="annee" defaultValue={anneeActuelle} className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl text-sm focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-quasi-noir mb-1.5">Montant (CFA)</label>
          <input type="number" name="montant" defaultValue={loyerMensuel} className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl text-sm focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all" />
        </div>

        <div>
          <label className="block text-xs font-bold text-quasi-noir mb-1.5">Statut</label>
          <select name="statut" className="w-full px-4 py-2.5 border border-ardoise-gris/30 rounded-xl text-sm focus:ring-2 focus:ring-indigo-principal bg-sable-fond outline-none text-quasi-noir transition-all">
            <option value="paye">Payé</option>
            <option value="en_attente">En attente</option>
            <option value="en_retard">En retard</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-indigo-principal text-white px-4 py-3 rounded-full font-bold hover:brightness-110 transition-all shadow-sm mt-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          Ajouter
        </button>
      </form>
    </div>
  )
}
