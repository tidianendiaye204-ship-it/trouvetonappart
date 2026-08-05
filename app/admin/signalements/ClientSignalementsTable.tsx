'use client'

import { useState } from 'react'
import { StatutSignalement } from '@/types'
import { traiterSignalement } from '@/app/actions/admin'
import { ShieldAlert, ExternalLink, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ClientSignalementsTable({ initialSignalements }: { initialSignalements: any[] }) {
  const [signalements, setSignalements] = useState(initialSignalements)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const handleTraiter = async (signalementId: string, nouveauStatut: StatutSignalement) => {
    setLoadingId(signalementId)
    const res = await traiterSignalement(signalementId, nouveauStatut)
    if (res.success) {
      setSignalements(signalements.map(s => s.id === signalementId ? { ...s, statut: nouveauStatut } : s))
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoadingId(null)
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-left border-collapse min-w-200">
        <thead>
          <tr className="bg-sable-fond/50 text-ardoise-gris text-xs uppercase tracking-wider">
            <th className="p-4 font-bold rounded-l-xl">Détails du Signalement</th>
            <th className="p-4 font-bold">Annonce concernée</th>
            <th className="p-4 font-bold">Signaleur</th>
            <th className="p-4 font-bold">Statut</th>
            <th className="p-4 font-bold rounded-r-xl text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ardoise-gris/10">
          {signalements.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-ardoise-gris">
                Aucun signalement.
              </td>
            </tr>
          ) : null}

          {signalements.map(sig => (
            <tr key={sig.id} className={`hover:bg-sable-fond/30 transition-colors ${loadingId === sig.id ? 'opacity-50' : ''}`}>
              <td className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shrink-0 mt-1">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-red-600 uppercase text-xs tracking-wider mb-1">
                      {sig.motif.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-quasi-noir max-w-xs">{sig.description || <span className="italic text-ardoise-gris">Aucune description</span>}</p>
                    <p className="text-xs text-ardoise-gris mt-2">{new Date(sig.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-sm">
                <p className="font-bold text-quasi-noir line-clamp-1">{sig.biens?.titre || 'Bien supprimé'}</p>
                {sig.biens && (
                  <Link 
                    href={`/annonce/${sig.bien_id}`} 
                    target="_blank"
                    className="text-xs font-bold text-indigo-principal flex items-center gap-1 mt-1 hover:underline"
                  >
                    Voir l'annonce <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </td>
              <td className="p-4 text-sm">
                <p className="font-bold text-quasi-noir">{sig.profiles?.nom || 'Anonyme'}</p>
              </td>
              <td className="p-4">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  sig.statut === 'traite' ? 'bg-emeraude/10 text-emeraude' :
                  sig.statut === 'rejete' ? 'bg-ardoise-gris/20 text-ardoise-gris' :
                  'bg-safran-accent/20 text-safran-accent'
                }`}>
                  {sig.statut.toUpperCase()}
                </span>
              </td>
              <td className="p-4 text-right">
                {sig.statut === 'nouveau' && (
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleTraiter(sig.id, 'traite')}
                      disabled={loadingId === sig.id}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emeraude/10 text-emeraude hover:bg-emeraude hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Traité
                    </button>
                    <button 
                      onClick={() => handleTraiter(sig.id, 'rejete')}
                      disabled={loadingId === sig.id}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-ardoise-gris/10 text-ardoise-gris hover:bg-ardoise-gris hover:text-white transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Rejeter
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
