'use client'

import { useState } from 'react'
import { creerAgence } from '@/app/actions/equipe'
import { Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreerAgenceForm() {
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) return

    setLoading(true)
    setError(null)

    const res = await creerAgence(nom)
    if (res.success) {
      router.refresh()
    } else {
      setError(res.error || 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
      
      <div>
        <label htmlFor="nomAgence" className="block text-sm font-bold text-quasi-noir mb-2">
          Nom de votre Agence / Société
        </label>
        <input
          id="nomAgence"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: Teranga Immobilier"
          className="w-full px-4 py-3 rounded-xl border border-ardoise-gris/20 focus:ring-2 focus:ring-indigo-principal focus:border-transparent transition-all"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !nom.trim()}
        className="w-full flex justify-center items-center gap-2 bg-indigo-principal text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>Créer mon Agence <ArrowRight className="w-5 h-5" /></>
        )}
      </button>
    </form>
  )
}
