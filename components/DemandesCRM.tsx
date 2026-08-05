'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, Phone, MessageCircle, Clock, ChevronRight, CheckCircle2, AlertCircle, X, History, FileText, Star, Flame, Snowflake, LayoutGrid, List } from 'lucide-react'
import DossierRevue from '@/components/DossierRevue'
import { trackClientEvent } from '@/app/actions/analytics'

type StatutDemande = 'nouveau' | 'contacte' | 'a_relancer' | 'visite_planifiee' | 'negociation' | 'converti' | 'perdu'

interface CRMEvent {
  id: string
  type_event: 'statut_change' | 'note_added' | 'whatsapp_sent' | 'call_made' | 'visite_planned'
  details: any
  created_at: string
}

interface Demande {
  id: string
  nom_demandeur: string
  telephone_demandeur: string
  message: string
  statut: StatutDemande
  notes_privees: string | null
  score: 1 | 2 | 3
  budget: number | null
  source: 'site' | 'whatsapp' | 'bouche_a_oreille' | 'autre'
  date_visite: string | null
  resultat_visite: string | null
  prochaine_relance: string | null
  date_dernier_contact: string | null
  created_at: string
  dossier_statut?: string
  dossier_score?: number
  dossier_token?: string
  biens: {
    titre: string
    proprietaire_id: string
  }
  crm_events?: CRMEvent[]
}

const STATUTS: { key: StatutDemande, label: string, color: string, border: string }[] = [
  { key: 'nouveau', label: 'Nouveau', color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
  { key: 'contacte', label: 'Contacté', color: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-200' },
  { key: 'a_relancer', label: 'À recontacter', color: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
  { key: 'visite_planifiee', label: 'Visite', color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  { key: 'negociation', label: 'Négo', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
  { key: 'converti', label: 'Validé', color: 'bg-green-100 text-green-800', border: 'border-green-200' },
  { key: 'perdu', label: 'Perdu', color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' },
]

export default function DemandesCRM({ initialDemandes }: { initialDemandes: Demande[] }) {
  const [demandes, setDemandes] = useState<Demande[]>(initialDemandes)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  // Calcul des rappels urgents
  const urgences = useMemo(() => {
    const now = new Date()
    return demandes.filter(d => d.prochaine_relance && new Date(d.prochaine_relance) <= now && !['converti', 'perdu'].includes(d.statut))
  }, [demandes])

  // --- ACTIONS SERVEUR ---
  
  const addEvent = async (demandeId: string, type: CRMEvent['type_event'], details: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null

      const { data } = await supabase.from('crm_events').insert({
        demande_id: demandeId,
        profil_id: session.user.id,
        type_event: type,
        details
      }).select().single()
      return data
    } catch (e) {
      console.error(e)
      return null
    }
  }

  const updateDemande = async (id: string, updates: Partial<Demande>, eventType?: CRMEvent['type_event'], eventDetails?: any) => {
    try {
      const { error } = await supabase.from('contacts_demandes').update(updates).eq('id', id)
      if (error) throw error
      
      let newEvent: any = null
      if (eventType) {
        newEvent = await addEvent(id, eventType, eventDetails)
      }

      setDemandes(prev => prev.map(d => {
        if (d.id === id) {
          const updated = { ...d, ...updates }
          if (newEvent) {
            updated.crm_events = [newEvent, ...(d.crm_events || [])]
          }
          if (selectedDemande?.id === id) setSelectedDemande(updated)
          return updated
        }
        return d
      }))
      
    } catch (e) {
      console.error("Erreur de mise à jour", e)
    }
  }

  // --- HANDLERS ---

  const handleStatusChange = (id: string, newStatut: StatutDemande) => {
    const old = demandes.find(d => d.id === id)?.statut
    updateDemande(id, { statut: newStatut }, 'statut_change', { old, new: newStatut })
    
    // Analytics
    if (old !== newStatut) {
      trackClientEvent('lead_status_changed', { demande_id: id, old_status: old, new_status: newStatut })
    }
  }

  const handleWhatsApp = (demande: Demande) => {
    // Nettoyage du numéro
    const phone = demande.telephone_demandeur.replace(/\D/g, '')
    const msg = `Bonjour ${demande.nom_demandeur}, suite à votre intérêt pour le bien "${demande.biens.titre}", je vous contacte pour...`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    
    updateDemande(demande.id, { date_dernier_contact: new Date().toISOString() }, 'whatsapp_sent', { template: 'Prise de contact' })
  }

  // --- RENDERERS ---

  const renderScore = (score: number) => {
    if (score === 3) return <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-1 rounded text-xs"><Flame className="w-3 h-3" /> Très intéressé</span>
    if (score === 2) return <span className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded text-xs"><Star className="w-3 h-3" /> Intéressé</span>
    return <span className="flex items-center gap-1 text-blue-400 font-bold bg-blue-50 px-2 py-1 rounded text-xs"><Snowflake className="w-3 h-3" /> Peu intéressé</span>
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER & RAPPELS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 bg-sable-fond p-1 rounded-lg border border-ardoise-gris/20">
          <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-principal' : 'text-ardoise-gris hover:text-quasi-noir'}`}>
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-principal' : 'text-ardoise-gris hover:text-quasi-noir'}`}>
            <List className="w-5 h-5" />
          </button>
        </div>

        {urgences.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl flex items-center gap-3 animate-pulse shadow-sm">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{urgences.length} contact(s) à recontacter urgemment !</span>
          </div>
        )}
      </div>

      {/* VUE KANBAN */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {STATUTS.map(col => {
            const colDemandes = demandes.filter(d => d.statut === col.key)
            return (
              <div key={col.key} className="min-w-75 w-75 shrink-0 bg-sable-fond/50 rounded-2xl p-3 border border-ardoise-gris/10 snap-start">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className={`font-bold text-sm px-3 py-1 rounded-full ${col.color}`}>{col.label}</h3>
                  <span className="text-xs font-bold text-ardoise-gris bg-white px-2 py-1 rounded-full">{colDemandes.length}</span>
                </div>
                
                <div className="space-y-3">
                  {colDemandes.map(d => (
                    <div 
                      key={d.id} 
                      onClick={() => setSelectedDemande(d)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-ardoise-gris/10 cursor-pointer hover:border-indigo-principal/40 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        {renderScore(d.score)}
                        <span className="text-[10px] text-ardoise-gris">
                          {new Date(d.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-quasi-noir text-sm mb-1">{d.nom_demandeur}</h4>
                      <p className="text-xs text-ardoise-gris truncate">{d.biens.titre}</p>
                      
                      {d.prochaine_relance && new Date(d.prochaine_relance) < new Date() && (
                        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded w-fit">
                          <Clock className="w-3 h-3" /> Rappel dépassé
                        </div>
                      )}
                    </div>
                  ))}
                  {colDemandes.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-ardoise-gris/20 rounded-xl">
                      <p className="text-xs text-ardoise-gris/50">Vide</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VUE LISTE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-sable-fond/50 border-b border-ardoise-gris/10">
              <tr>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs tracking-wider">Contact</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs tracking-wider">Bien</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs tracking-wider">Statut</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs tracking-wider">Score</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {demandes.map(d => {
                const s = STATUTS.find(x => x.key === d.statut)!
                return (
                  <tr key={d.id} className="hover:bg-sable-fond/30 transition-colors cursor-pointer" onClick={() => setSelectedDemande(d)}>
                    <td className="p-4">
                      <div className="font-bold text-quasi-noir">{d.nom_demandeur}</div>
                      <div className="text-xs text-ardoise-gris">{d.telephone_demandeur}</div>
                    </td>
                    <td className="p-4 text-ardoise-gris truncate max-w-50">{d.biens.titre}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="p-4">{renderScore(d.score)}</td>
                    <td className="p-4 text-right">
                      <button className="text-indigo-principal hover:underline text-xs font-bold">Détails</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SIDE PANEL / MODAL DETAIL */}
      {selectedDemande && (
        <div className="fixed inset-0 z-50 flex justify-end bg-quasi-noir/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-ardoise-gris/10 bg-sable-fond/30 sticky top-0 z-10 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-quasi-noir mb-1">{selectedDemande.nom_demandeur}</h2>
                <p className="text-sm text-ardoise-gris flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {selectedDemande.telephone_demandeur}
                </p>
              </div>
              <button onClick={() => setSelectedDemande(null)} className="p-2 bg-white rounded-full border border-ardoise-gris/20 hover:bg-sable-fond">
                <X className="w-5 h-5 text-quasi-noir" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-8">
              
              {/* Actions rapides */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleWhatsApp(selectedDemande)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle className="w-5 h-5" /> Contacter par WhatsApp
                </button>
              </div>

              {/* Qualification */}
              <div className="bg-white border border-ardoise-gris/20 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-quasi-noir text-sm uppercase tracking-wider mb-2 border-b border-ardoise-gris/10 pb-2">Qualification</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-ardoise-gris block mb-1">Score</label>
                    <select 
                      value={selectedDemande.score}
                      onChange={(e) => updateDemande(selectedDemande.id, { score: parseInt(e.target.value) as 1|2|3 }, 'note_added', { text: `Score mis à jour: ${e.target.value}` })}
                      className="w-full text-sm border-ardoise-gris/20 rounded-lg p-2 bg-sable-fond"
                    >
                      <option value={3}>🔥 Très intéressé</option>
                      <option value={2}>⭐️ Intéressé</option>
                      <option value={1}>❄️ Peu intéressé</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-ardoise-gris block mb-1">Statut</label>
                    <select 
                      value={selectedDemande.statut}
                      onChange={(e) => handleStatusChange(selectedDemande.id, e.target.value as StatutDemande)}
                      className="w-full text-sm border-ardoise-gris/20 rounded-lg p-2 bg-sable-fond font-bold"
                    >
                      {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-ardoise-gris block mb-1">Budget (FCFA)</label>
                    <input 
                      type="number" 
                      defaultValue={selectedDemande.budget || ''}
                      onBlur={(e) => updateDemande(selectedDemande.id, { budget: parseInt(e.target.value) || null })}
                      className="w-full text-sm border-ardoise-gris/20 rounded-lg p-2 bg-sable-fond"
                      placeholder="Ex: 500000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ardoise-gris block mb-1">Date pour recontacter</label>
                    <input 
                      type="date" 
                      defaultValue={selectedDemande.prochaine_relance ? selectedDemande.prochaine_relance.split('T')[0] : ''}
                      onBlur={(e) => updateDemande(selectedDemande.id, { prochaine_relance: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className="w-full text-sm border-ardoise-gris/20 rounded-lg p-2 bg-sable-fond"
                    />
                  </div>
                </div>
              </div>

              {/* DOSSIER LOCATAIRE */}
              {selectedDemande.dossier_token && (
                <DossierRevue 
                  demandeId={selectedDemande.id} 
                  token={selectedDemande.dossier_token} 
                  nom={selectedDemande.nom_demandeur}
                  onStatutChange={(s) => updateDemande(selectedDemande.id, { dossier_statut: s }, 'note_added', { text: `Statut du dossier mis à jour : ${s}` })}
                />
              )}

              {/* Message initial */}
              <div>
                <h3 className="font-bold text-quasi-noir text-sm uppercase tracking-wider mb-2">Message du site</h3>
                <div className="bg-sable-fond/50 p-4 rounded-xl text-sm italic text-ardoise-gris border border-ardoise-gris/10">
                  {selectedDemande.message || "Aucun message laissé."}
                </div>
              </div>

              {/* Notes Privées */}
              <div>
                <h3 className="font-bold text-quasi-noir text-sm uppercase tracking-wider mb-2">Notes privées</h3>
                <textarea 
                  defaultValue={selectedDemande.notes_privees || ''}
                  onBlur={(e) => {
                    if (e.target.value !== selectedDemande.notes_privees) {
                      updateDemande(selectedDemande.id, { notes_privees: e.target.value }, 'note_added', { text: "Notes mises à jour" })
                    }
                  }}
                  className="w-full h-32 p-3 border border-ardoise-gris/20 rounded-xl text-sm bg-sable-fond focus:bg-white transition-colors resize-none"
                  placeholder="Écrivez vos notes d'appel, d'impression, etc."
                />
              </div>

              {/* TIMELINE */}
              <div>
                <h3 className="font-bold text-quasi-noir text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> Historique d'actions
                </h3>
                
                <div className="space-y-4 border-l-2 border-ardoise-gris/20 ml-2 pl-4 relative">
                  {/* Event initial */}
                  <div className="relative">
                    <div className="absolute -left-5.25 top-1 w-2 h-2 rounded-full bg-ardoise-gris ring-4 ring-white"></div>
                    <p className="text-xs text-ardoise-gris mb-0.5">{new Date(selectedDemande.created_at).toLocaleString('fr-FR')}</p>
                    <p className="text-sm font-medium text-quasi-noir">Demande reçue via le site</p>
                  </div>
                  
                  {/* Events dynamiques */}
                  {selectedDemande.crm_events?.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(ev => (
                    <div key={ev.id} className="relative">
                      <div className="absolute -left-5.25 top-1 w-2 h-2 rounded-full bg-indigo-principal ring-4 ring-white"></div>
                      <p className="text-xs text-ardoise-gris mb-0.5">{new Date(ev.created_at).toLocaleString('fr-FR')}</p>
                      
                      {ev.type_event === 'statut_change' && (
                        <p className="text-sm text-quasi-noir">
                          Statut passé à <strong className="bg-sable-fond px-1 rounded">{STATUTS.find(s => s.key === ev.details.new)?.label}</strong>
                        </p>
                      )}
                      {ev.type_event === 'whatsapp_sent' && (
                        <p className="text-sm text-quasi-noir flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-green-500" /> WhatsApp envoyé
                        </p>
                      )}
                      {ev.type_event === 'note_added' && (
                        <p className="text-sm italic text-ardoise-gris">
                          {ev.details.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
