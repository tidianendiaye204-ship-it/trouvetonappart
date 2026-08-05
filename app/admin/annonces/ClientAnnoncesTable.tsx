'use client'

import { useState } from 'react'
import { StatutModeration } from '@/types'
import { modererBien } from '@/app/actions/admin'
import { verifyPhotos } from '@/app/actions/verification'
import { Home, ExternalLink, Check, X, Ban, Camera, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ClientAnnoncesTable({ initialAnnonces }: { initialAnnonces: any[] }) {
  const [annonces, setAnnonces] = useState(initialAnnonces)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<StatutModeration | 'tout'>('en_attente')
  const router = useRouter()

  const annoncesFiltrees = filtre === 'tout' 
    ? annonces 
    : annonces.filter(a => a.statut_moderation === filtre)

  const handleModeration = async (bienId: string, nouveauStatut: StatutModeration) => {
    setLoadingId(bienId)
    const raison = nouveauStatut === 'rejete' || nouveauStatut === 'suspendu' 
      ? prompt('Raison du rejet/suspension (optionnel) :') || undefined
      : undefined

    const res = await modererBien(bienId, nouveauStatut, raison)
    if (res.success) {
      setAnnonces(annonces.map(a => a.id === bienId ? { ...a, statut_moderation: nouveauStatut } : a))
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoadingId(null)
  }

  const handleVerificationPhotos = async (bienId: string, currentState: boolean) => {
    setLoadingId(bienId)
    const action = currentState ? 'unverify' : 'verify'
    const res = await verifyPhotos(bienId, action)
    if (res.success) {
      setAnnonces(annonces.map(a => a.id === bienId ? { ...a, photos_verified: !currentState } : a))
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoadingId(null)
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['en_attente', 'valide', 'rejete', 'suspendu', 'tout'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              filtre === f 
                ? 'bg-quasi-noir text-white' 
                : 'bg-sable-fond text-ardoise-gris hover:bg-ardoise-gris/20'
            }`}
          >
            {f === 'tout' ? 'Toutes' : f.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-200">
          <thead>
            <tr className="bg-sable-fond/50 text-ardoise-gris text-xs uppercase tracking-wider">
              <th className="p-4 font-bold rounded-l-xl">Annonce</th>
              <th className="p-4 font-bold">Propriétaire</th>
              <th className="p-4 font-bold">Prix</th>
              <th className="p-4 font-bold">Statut</th>
              <th className="p-4 font-bold">Confiance</th>
              <th className="p-4 font-bold rounded-r-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ardoise-gris/10">
            {annoncesFiltrees.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ardoise-gris">
                  Aucune annonce pour ce filtre.
                </td>
              </tr>
            ) : null}

            {annoncesFiltrees.map(annonce => (
              <tr key={annonce.id} className={`hover:bg-sable-fond/30 transition-colors ${loadingId === annonce.id ? 'opacity-50' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-safran-accent/10 rounded-xl flex items-center justify-center text-safran-accent shrink-0">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-quasi-noir line-clamp-1">{annonce.titre}</p>
                      <p className="text-xs text-ardoise-gris">{annonce.ville} • {annonce.type}</p>
                      <Link 
                        href={`/annonce/${annonce.id}`} 
                        target="_blank"
                        className="text-xs font-bold text-indigo-principal flex items-center gap-1 mt-1 hover:underline"
                      >
                        Voir page <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm">
                  <p className="font-bold text-quasi-noir">{annonce.profiles?.nom}</p>
                  <p className="text-xs text-ardoise-gris">{annonce.profiles?.telephone}</p>
                </td>
                <td className="p-4">
                  <p className="font-black text-quasi-noir">{new Intl.NumberFormat('fr-SN').format(annonce.prix)}</p>
                  <p className="text-xs text-ardoise-gris uppercase">{annonce.transaction}</p>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    annonce.statut_moderation === 'valide' ? 'bg-emeraude/10 text-emeraude' :
                    annonce.statut_moderation === 'rejete' ? 'bg-red-100 text-red-600' :
                    annonce.statut_moderation === 'suspendu' ? 'bg-ardoise-gris/20 text-ardoise-gris' :
                    'bg-safran-accent/20 text-safran-accent'
                  }`}>
                    {annonce.statut_moderation.replace('_', ' ').toUpperCase()}
                  </span>
                  {!annonce.publie && <span className="ml-2 text-[10px] text-ardoise-gris uppercase font-bold">(Brouillon)</span>}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => handleVerificationPhotos(annonce.id, annonce.photos_verified)}
                      disabled={loadingId === annonce.id}
                      className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                        annonce.photos_verified ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-ardoise-gris/10 text-ardoise-gris hover:bg-ardoise-gris/20'
                      }`}
                      title="Certifier les photos"
                    >
                      <Camera className="w-3 h-3" /> 
                      {annonce.photos_verified ? 'Photos certifiées' : 'Certifier photos'}
                    </button>
                    <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                      annonce.profiles?.is_verified ? 'bg-amber-100 text-amber-700' : 'bg-ardoise-gris/10 text-ardoise-gris'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      {annonce.profiles?.is_verified ? 'Propriétaire Vérifié' : 'Non Vérifié'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {annonce.statut_moderation !== 'valide' && (
                      <button 
                        onClick={() => handleModeration(annonce.id, 'valide')}
                        disabled={loadingId === annonce.id}
                        className="p-2 rounded-lg bg-emeraude/10 text-emeraude hover:bg-emeraude hover:text-white transition-colors"
                        title="Valider"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    
                    {annonce.statut_moderation === 'en_attente' && (
                      <button 
                        onClick={() => handleModeration(annonce.id, 'rejete')}
                        disabled={loadingId === annonce.id}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        title="Rejeter"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {annonce.statut_moderation === 'valide' && (
                      <button 
                        onClick={() => handleModeration(annonce.id, 'suspendu')}
                        disabled={loadingId === annonce.id}
                        className="p-2 rounded-lg bg-ardoise-gris/10 text-ardoise-gris hover:bg-ardoise-gris hover:text-white transition-colors"
                        title="Suspendre"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
