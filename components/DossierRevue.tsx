'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileCheck, FileText, CheckCircle2, AlertCircle, Eye, Link2, ExternalLink } from 'lucide-react'

export default function DossierRevue({ demandeId, token, nom, onStatutChange }: { demandeId: string, token: string, nom: string, onStatutChange: (s: string) => void }) {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDocs() {
      const { data } = await supabase
        .from('dossiers_documents')
        .select('*')
        .eq('demande_id', demandeId)
      setDocs(data || [])
      setLoading(false)
    }
    loadDocs()
  }, [demandeId])

  const handleCopyLink = () => {
    const url = `${window.location.origin}/candidature/${token}`
    navigator.clipboard.writeText(url)
    alert("Lien de dépôt de dossier copié !")
  }

  const handleWhatsAppLink = () => {
    const url = `${window.location.origin}/candidature/${token}`
    const text = encodeURIComponent(`Bonjour ${nom},\nMerci de constituer votre dossier de location en ligne via ce lien sécurisé :\n\n${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const updateDocStatut = async (docId: string, statut: string) => {
    await supabase.from('dossiers_documents').update({ statut_validation: statut }).eq('id', docId)
    setDocs(docs.map(d => d.id === docId ? { ...d, statut_validation: statut } : d))
  }

  const validerDossier = async (finalStatut: string) => {
    await supabase.from('contacts_demandes').update({ dossier_statut: finalStatut }).eq('id', demandeId)
    onStatutChange(finalStatut)
  }

  const getPublicUrl = async (path: string) => {
    // Dans une app réelle avec bucket privé, il faudrait créer une signedUrl.
    // Pour l'exemple, on crée une signed url valide 60s
    const { data } = await supabase.storage.from('dossiers-prives').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="bg-white border border-ardoise-gris/20 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-ardoise-gris/10 pb-2">
        <h3 className="font-bold text-quasi-noir text-sm uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-principal" /> Dossier de Location
        </h3>
        <div className="flex gap-2">
          <button onClick={handleCopyLink} className="text-xs text-indigo-principal hover:underline flex items-center gap-1"><Link2 className="w-3 h-3" /> Copier lien</button>
          <button onClick={handleWhatsAppLink} className="text-xs text-green-600 hover:underline flex items-center gap-1">WhatsApp</button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ardoise-gris">Chargement des pièces...</p>
      ) : docs.length === 0 ? (
        <div className="text-center py-4 bg-sable-fond rounded-xl border border-dashed border-ardoise-gris/20">
          <p className="text-sm text-ardoise-gris mb-2">Aucune pièce reçue.</p>
          <button onClick={handleWhatsAppLink} className="text-xs font-bold text-indigo-principal">Demander le dossier</button>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between bg-sable-fond p-2 rounded-lg text-sm border border-ardoise-gris/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-ardoise-gris" />
                <span className="font-bold uppercase text-xs">{doc.type_document.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                {doc.statut_validation === 'valide' && <div title="Validé"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>}
                {doc.statut_validation === 'rejete' && <div title="Rejeté"><AlertCircle className="w-4 h-4 text-red-600" /></div>}
                
                <button onClick={() => getPublicUrl(doc.file_path)} className="p-1 hover:bg-white rounded text-indigo-principal" title="Voir">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="flex bg-white rounded border border-ardoise-gris/20 overflow-hidden">
                  <button onClick={() => updateDocStatut(doc.id, 'valide')} className="px-2 py-1 text-xs hover:bg-green-50 text-green-700">OK</button>
                  <button onClick={() => updateDocStatut(doc.id, 'rejete')} className="px-2 py-1 text-xs border-l border-ardoise-gris/20 hover:bg-red-50 text-red-700">KO</button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-3 flex gap-2">
            <button onClick={() => validerDossier('valide')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-xs shadow-sm">
              Accepter Dossier
            </button>
            <button onClick={() => validerDossier('refuse')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold text-xs shadow-sm">
              Refuser
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
