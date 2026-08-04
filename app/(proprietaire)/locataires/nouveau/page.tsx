'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NouveauLocatairePage() {
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Vous n'êtes pas connecté.")

      const prenom = formData.get('prenom') as string
      const nom = formData.get('nom') as string
      const email = formData.get('email') as string
      const telephone = formData.get('telephone') as string
      const cni = formData.get('cni') as string
      const notes = formData.get('notes') as string

      const { error: insertError } = await supabase
        .from('locataires')
        .insert({
          proprietaire_id: user.id,
          prenom,
          nom,
          email: email || null,
          telephone,
          cni: cni || null,
          notes: notes || null
        })

      if (insertError) throw insertError

      router.push('/locataires')
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/locataires" className="text-ardoise-gris hover:text-quasi-noir flex items-center gap-2 text-sm font-medium w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour aux locataires
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-quasi-noir">Nouveau Locataire</h1>
        <p className="text-ardoise-gris mt-1">Ajoutez un contact à votre répertoire locatif.</p>
      </div>

      <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-quasi-noir mb-1.5">Prénom *</label>
              <input type="text" id="prenom" name="prenom" required className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50" placeholder="Ex: Mamadou" />
            </div>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-quasi-noir mb-1.5">Nom *</label>
              <input type="text" id="nom" name="nom" required className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50" placeholder="Ex: Diop" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-quasi-noir mb-1.5">Téléphone *</label>
              <input type="tel" id="telephone" name="telephone" required className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50" placeholder="Ex: 77 123 45 67" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-quasi-noir mb-1.5">Email (optionnel)</label>
              <input type="email" id="email" name="email" className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50" placeholder="Ex: mamadou.diop@email.com" />
            </div>
          </div>

          <div>
            <label htmlFor="cni" className="block text-sm font-medium text-quasi-noir mb-1.5">Numéro de CNI / Passeport (optionnel)</label>
            <input type="text" id="cni" name="cni" className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50" placeholder="Ex: 1234567890123" />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-quasi-noir mb-1.5">Notes (optionnel)</label>
            <textarea id="notes" name="notes" rows={3} className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50" placeholder="Informations complémentaires, profession, situation familiale..."></textarea>
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
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer le locataire
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
