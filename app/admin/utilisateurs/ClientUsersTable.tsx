'use client'

import { useState } from 'react'
import { Profile, StatutCompte } from '@/types'
import { changerStatutCompte, changerRole } from '@/app/actions/admin'
import { Shield, ShieldAlert, User, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ClientUsersTable({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const handleStatutChange = async (userId: string, nouveauStatut: StatutCompte) => {
    setLoadingId(userId)
    const res = await changerStatutCompte(userId, nouveauStatut)
    if (res.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, statut_compte: nouveauStatut } : u))
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoadingId(null)
  }

  const handleRoleChange = async (userId: string, nouveauRole: 'proprietaire' | 'chercheur' | 'admin') => {
    if (!confirm(`Passer cet utilisateur en ${nouveauRole} ?`)) return
    
    setLoadingId(userId)
    const res = await changerRole(userId, nouveauRole)
    if (res.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: nouveauRole } : u))
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoadingId(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-sable-fond/50 text-ardoise-gris text-xs uppercase tracking-wider">
            <th className="p-4 font-bold">Utilisateur</th>
            <th className="p-4 font-bold">Contact</th>
            <th className="p-4 font-bold">Rôle</th>
            <th className="p-4 font-bold">Statut</th>
            <th className="p-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ardoise-gris/10">
          {users.map(user => (
            <tr key={user.id} className={`hover:bg-sable-fond/30 transition-colors ${loadingId === user.id ? 'opacity-50' : ''}`}>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-principal/10 rounded-full flex items-center justify-center text-indigo-principal">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-quasi-noir">{user.nom}</p>
                    <p className="text-xs text-ardoise-gris">{new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-sm text-quasi-noir">
                {user.telephone || <span className="text-ardoise-gris italic">Non renseigné</span>}
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === 'admin' ? 'bg-red-100 text-red-700' :
                  user.role === 'proprietaire' ? 'bg-indigo-principal/10 text-indigo-principal' :
                  'bg-safran-accent/20 text-quasi-noir'
                }`}>
                  {user.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                  {user.role.toUpperCase()}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  user.statut_compte === 'actif' ? 'bg-emeraude/10 text-emeraude' : 'bg-ardoise-gris/20 text-ardoise-gris'
                }`}>
                  {user.statut_compte.toUpperCase()}
                </span>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  {user.statut_compte === 'actif' ? (
                    <button 
                      onClick={() => handleStatutChange(user.id, 'suspendu')}
                      disabled={loadingId === user.id}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-ardoise-gris/10 text-ardoise-gris hover:bg-ardoise-gris hover:text-white transition-colors"
                    >
                      Suspendre
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatutChange(user.id, 'actif')}
                      disabled={loadingId === user.id}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emeraude/10 text-emeraude hover:bg-emeraude hover:text-white transition-colors"
                    >
                      Activer
                    </button>
                  )}

                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleRoleChange(user.id, 'admin')}
                      disabled={loadingId === user.id}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Passer Admin
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
