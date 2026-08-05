'use client'

import { useState } from 'react'
import { ShieldAlert, X, Loader2 } from 'lucide-react'
import { signalerBien } from '@/app/actions/public'
import { MotifSignalement } from '@/types'

export default function BoutonSignaler({ bienId }: { bienId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [motif, setMotif] = useState<MotifSignalement>('autre')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const res = await signalerBien(bienId, motif, description)
    
    setIsLoading(false)
    if (res.success) {
      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setDescription('')
      }, 3000)
    } else {
      setError(res.error || 'Erreur inconnue')
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs font-bold text-ardoise-gris hover:text-red-500 transition-colors mt-8 p-2 rounded-lg hover:bg-red-50"
      >
        <ShieldAlert className="w-4 h-4" />
        Signaler un problème avec cette annonce
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quasi-noir/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-ardoise-gris hover:text-quasi-noir bg-sable-fond rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-quasi-noir mb-2 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" /> Signaler l'annonce
            </h3>
            
            {success ? (
              <div className="bg-emeraude/10 text-emeraude p-4 rounded-xl mt-6">
                <p className="font-bold">Merci pour votre signalement !</p>
                <p className="text-sm mt-1">Notre équipe de modération va examiner cette annonce dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-quasi-noir mb-2">Motif du signalement</label>
                  <select 
                    value={motif}
                    onChange={(e) => setMotif(e.target.value as MotifSignalement)}
                    className="w-full bg-sable-fond border-0 rounded-xl px-4 py-3 text-quasi-noir font-medium focus:ring-2 focus:ring-indigo-principal"
                  >
                    <option value="fraude">Suspicion d'arnaque / Fraude</option>
                    <option value="deja_loue">Ce bien est déjà loué / vendu</option>
                    <option value="inapproprie">Contenu inapproprié</option>
                    <option value="autre">Autre raison</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-quasi-noir mb-2">Détails (Optionnel)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Pouvez-vous nous en dire plus ?"
                    rows={4}
                    className="w-full bg-sable-fond border-0 rounded-xl px-4 py-3 text-quasi-noir font-medium focus:ring-2 focus:ring-indigo-principal resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer le signalement'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
