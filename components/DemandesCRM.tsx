'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type StatutDemande = 'nouveau' | 'a_relancer' | 'visite_planifiee' | 'converti' | 'perdu'

interface Demande {
  id: string
  nom_demandeur: string
  telephone_demandeur: string
  message: string
  statut: StatutDemande
  notes_privees: string | null
  date_dernier_contact: string | null
  created_at: string
  biens: {
    titre: string
    proprietaire_id: string
  }
}

export default function DemandesCRM({ initialDemandes }: { initialDemandes: Demande[] }) {
  const [demandes, setDemandes] = useState<Demande[]>(initialDemandes)
  const [filtre, setFiltre] = useState<StatutDemande | 'tous'>('tous')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const mapStatut = {
    'nouveau': { label: 'Nouveau', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'a_relancer': { label: 'À relancer', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    'visite_planifiee': { label: 'Visite planifiée', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'converti': { label: 'Converti', color: 'bg-green-100 text-green-800 border-green-200' },
    'perdu': { label: 'Perdu', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  }

  const handleStatusChange = async (id: string, newStatut: StatutDemande) => {
    setLoadingId(id)
    try {
      const { error } = await supabase
        .from('contacts_demandes')
        .update({ statut: newStatut })
        .eq('id', id)

      if (!error) {
        setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: newStatut } : d))
        router.refresh()
      } else {
        console.error("Erreur mise à jour statut", error)
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleNotesChange = async (id: string, newNotes: string) => {
    try {
      await supabase
        .from('contacts_demandes')
        .update({ notes_privees: newNotes })
        .eq('id', id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCall = async (id: string) => {
    try {
      const now = new Date().toISOString()
      await supabase
        .from('contacts_demandes')
        .update({ date_dernier_contact: now, statut: 'a_relancer' })
        .eq('id', id)
      
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, date_dernier_contact: now, statut: d.statut === 'nouveau' ? 'a_relancer' : d.statut } : d))
    } catch (e) {
      console.error(e)
    }
  }

  const demandesFiltrees = filtre === 'tous' ? demandes : demandes.filter(d => d.statut === filtre)

  // Statistiques
  const stats = {
    nouveau: demandes.filter(d => d.statut === 'nouveau').length,
    a_relancer: demandes.filter(d => d.statut === 'a_relancer').length,
    visite_planifiee: demandes.filter(d => d.statut === 'visite_planifiee').length,
    converti: demandes.filter(d => d.statut === 'converti').length,
  }

  return (
    <div className="space-y-8">
      
      {/* Dashboard Top - Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-ardoise-gris/10 shadow-sm">
          <p className="text-sm font-medium text-ardoise-gris">Nouveaux</p>
          <p className="text-3xl font-black text-blue-600">{stats.nouveau}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-ardoise-gris/10 shadow-sm">
          <p className="text-sm font-medium text-ardoise-gris">À relancer</p>
          <p className="text-3xl font-black text-orange-600">{stats.a_relancer}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-ardoise-gris/10 shadow-sm">
          <p className="text-sm font-medium text-ardoise-gris">Visites</p>
          <p className="text-3xl font-black text-purple-600">{stats.visite_planifiee}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-ardoise-gris/10 shadow-sm">
          <p className="text-sm font-medium text-ardoise-gris">Convertis</p>
          <p className="text-3xl font-black text-green-600">{stats.converti}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFiltre('tous')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filtre === 'tous' ? 'bg-quasi-noir text-white' : 'bg-sable-fond text-quasi-noir hover:bg-ardoise-gris/10'}`}
        >
          Tous ({demandes.length})
        </button>
        {Object.entries(mapStatut).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setFiltre(key as StatutDemande)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${filtre === key ? color : 'bg-white text-quasi-noir border-ardoise-gris/20 hover:border-ardoise-gris/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste CRM */}
      {demandesFiltrees.length === 0 ? (
        <div className="text-center py-20 bg-sable-fond/50 rounded-3xl border border-dashed border-ardoise-gris/30">
          <p className="text-ardoise-gris">Aucune demande trouvée pour ce filtre.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {demandesFiltrees.map((demande) => {
            const currentStatut = mapStatut[demande.statut || 'nouveau'];
            const isHot = demande.statut === 'visite_planifiee' || demande.statut === 'nouveau';
            
            return (
              <div 
                key={demande.id} 
                className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden flex flex-col md:flex-row ${isHot ? 'border-indigo-principal/30 shadow-indigo-principal/5' : 'border-ardoise-gris/10'}`}
              >
                {/* Left side : Info prospect */}
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-ardoise-gris/10 bg-sable-fond/20">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${currentStatut.color}`}>
                      {currentStatut.label}
                    </span>
                    <span className="text-xs text-ardoise-gris">
                      {new Date(demande.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-bold text-xl text-quasi-noir">{demande.nom_demandeur}</h3>
                  <div className="mt-2 space-y-2">
                    <a href={`tel:${demande.telephone_demandeur}`} onClick={() => handleCall(demande.id)} className="flex items-center gap-2 text-indigo-principal font-medium hover:underline w-fit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {demande.telephone_demandeur}
                    </a>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-ardoise-gris/10">
                    <p className="text-xs text-ardoise-gris mb-1">Bien intéressé :</p>
                    <p className="text-sm font-semibold text-quasi-noir truncate">{demande.biens?.titre}</p>
                  </div>
                </div>

                {/* Middle side : Notes & Message */}
                <div className="p-6 md:w-2/3 flex flex-col gap-4">
                  
                  {demande.message && (
                    <div>
                      <p className="text-xs font-bold text-ardoise-gris uppercase tracking-wider mb-2">Message initial</p>
                      <div className="p-3 bg-sable-fond/50 rounded-xl text-sm text-quasi-noir/80 italic">
                        "{demande.message}"
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold text-ardoise-gris uppercase tracking-wider">Notes privées</p>
                      {demande.date_dernier_contact && (
                        <p className="text-xs text-ardoise-gris">
                          Dernier contact : {new Date(demande.date_dernier_contact).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <textarea 
                      defaultValue={demande.notes_privees || ''}
                      onBlur={(e) => {
                        if (e.target.value !== demande.notes_privees) {
                          handleNotesChange(demande.id, e.target.value)
                        }
                      }}
                      placeholder="Ajouter une note sur ce prospect (budget, visite...)"
                      className="w-full h-24 p-3 bg-white border border-ardoise-gris/20 rounded-xl text-sm focus:ring-2 focus:ring-indigo-principal outline-none resize-none transition-all placeholder:text-ardoise-gris/50"
                    />
                  </div>

                  {/* Actions Rapides */}
                  <div className="pt-2 flex flex-wrap gap-2 items-center">
                    <p className="text-xs text-ardoise-gris mr-2">Changer le statut :</p>
                    {['a_relancer', 'visite_planifiee', 'converti', 'perdu'].map((st) => (
                      demande.statut !== st && (
                        <button
                          key={st}
                          disabled={loadingId === demande.id}
                          onClick={() => handleStatusChange(demande.id, st as StatutDemande)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-ardoise-gris/20 bg-white hover:bg-sable-fond transition-colors disabled:opacity-50"
                        >
                          {mapStatut[st as keyof typeof mapStatut].label}
                        </button>
                      )
                    ))}
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
