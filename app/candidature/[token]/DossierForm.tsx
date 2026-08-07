'use client'

import { useState } from 'react'
import { updateDossierInfos } from '@/app/actions/dossier'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'

export default function DossierForm({ 
  token,
  initialData
}: { 
  token: string,
  initialData: any
}) {
  const [formData, setFormData] = useState({
    email_demandeur: initialData?.email_demandeur || '',
    profession: initialData?.profession || '',
    revenu_mensuel: initialData?.revenu_mensuel || '',
    type_garant: initialData?.type_garant || '',
    type_piece: initialData?.type_piece || 'cni'
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    const res = await updateDossierInfos(token, {
      ...formData,
      revenu_mensuel: Number(formData.revenu_mensuel) || 0
    })
    
    if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(res.error || 'Erreur lors de la sauvegarde.')
    }
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ardoise-gris/10 p-6 shadow-sm space-y-4">
      <div className="border-b border-ardoise-gris/10 pb-4 mb-4">
        <h2 className="font-bold text-lg text-quasi-noir">Étape 1 : Vos informations</h2>
        <p className="text-sm text-ardoise-gris">Complétez ces champs pour faciliter l'étude de votre dossier.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-quasi-noir mb-1">Email</label>
          <input 
            type="email" 
            name="email_demandeur" 
            value={formData.email_demandeur} 
            onChange={handleChange} 
            className="w-full px-4 py-2 bg-sable-fond border border-ardoise-gris/20 rounded-xl focus:outline-none focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal"
            placeholder="votre@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-quasi-noir mb-1">Profession</label>
          <input 
            type="text" 
            name="profession" 
            value={formData.profession} 
            onChange={handleChange} 
            className="w-full px-4 py-2 bg-sable-fond border border-ardoise-gris/20 rounded-xl focus:outline-none focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal"
            placeholder="Ex: Cadre, Entrepreneur, Etudiant..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-quasi-noir mb-1">Revenu Mensuel (FCFA)</label>
          <input 
            type="number" 
            name="revenu_mensuel" 
            value={formData.revenu_mensuel} 
            onChange={handleChange} 
            className="w-full px-4 py-2 bg-sable-fond border border-ardoise-gris/20 rounded-xl focus:outline-none focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal"
            placeholder="Ex: 500000"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-quasi-noir mb-1">Garant</label>
          <select 
            name="type_garant" 
            value={formData.type_garant} 
            onChange={handleChange} 
            className="w-full px-4 py-2 bg-sable-fond border border-ardoise-gris/20 rounded-xl focus:outline-none focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal"
            required
          >
            <option value="">Sélectionnez un type</option>
            <option value="aucun">Aucun garant</option>
            <option value="parent">Parent / Proche</option>
            <option value="institution">Garantie institutionnelle / Entreprise</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-quasi-noir mb-1">Type de Pièce d'identité fournie</label>
          <select 
            name="type_piece" 
            value={formData.type_piece} 
            onChange={handleChange} 
            className="w-full px-4 py-2 bg-sable-fond border border-ardoise-gris/20 rounded-xl focus:outline-none focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal"
            required
          >
            <option value="cni">Carte Nationale d'Identité</option>
            <option value="passeport">Passeport</option>
            <option value="carte_sejour">Carte de Séjour</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-ardoise-gris/10">
        <div className="text-sm">
          {error && <span className="text-red-500 font-bold">{error}</span>}
          {saved && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Enregistré</span>}
        </div>
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-indigo-principal text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>
    </form>
  )
}
