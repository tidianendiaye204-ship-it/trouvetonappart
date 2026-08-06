import { createClient } from '@/lib/supabase/server'
import { Users, CalendarDays, ExternalLink, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Fetch all profiles, and count their properties and leads
  // Since Supabase doesn't easily allow multi-level counting in a single join, 
  // we fetch them and aggregate in memory for the admin view.
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id,
      nom,
      telephone,
      role,
      statut_compte,
      created_at,
      biens (
        id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Erreur lors du chargement des utilisateurs : {error.message}</div>
  }

  // We also need the count of leads per owner to prove value
  const { data: leads } = await supabase
    .from('contacts_demandes')
    .select('id, biens ( proprietaire_id )')

  // Aggregate leads by owner id
  const leadsByOwner: Record<string, number> = {}
  if (leads) {
    leads.forEach((lead: any) => {
      const ownerId = lead.biens?.proprietaire_id
      if (ownerId) {
        leadsByOwner[ownerId] = (leadsByOwner[ownerId] || 0) + 1
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-principal" />
          Gestion des Utilisateurs
        </h1>
        <p className="text-ardoise-gris">
          Visualisez l'activité de vos propriétaires, leurs annonces et les leads que vous leur générez.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-ardoise-gris/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-sable-fond/50 text-ardoise-gris text-xs uppercase tracking-wider">
                <th className="p-4 font-bold rounded-tl-3xl">Inscription</th>
                <th className="p-4 font-bold">Utilisateur</th>
                <th className="p-4 font-bold">Annonces</th>
                <th className="p-4 font-bold">Leads Générés (Preuve)</th>
                <th className="p-4 font-bold rounded-tr-3xl text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {profiles?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ardoise-gris">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : null}

              {profiles?.map((profile: any) => {
                const totalBiens = profile.biens?.length || 0
                const totalLeads = leadsByOwner[profile.id] || 0

                return (
                  <tr key={profile.id} className="hover:bg-sable-fond/30 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-quasi-noir">
                        <CalendarDays className="w-4 h-4 text-ardoise-gris" />
                        {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-quasi-noir text-sm">{profile.nom}</p>
                        {profile.role === 'admin' && <span title="Administrateur"><ShieldCheck className="w-4 h-4 text-indigo-principal" /></span>}
                      </div>
                      <a href={`tel:${profile.telephone}`} className="text-xs text-indigo-principal hover:underline">
                        {profile.telephone || 'Aucun numéro'}
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-quasi-noir">{totalBiens}</span>
                      <span className="text-xs text-ardoise-gris ml-1">publiée(s)</span>
                    </td>
                    <td className="p-4">
                      {profile.role === 'proprietaire' ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${totalLeads > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                            {totalLeads}
                          </span>
                          <span className="text-xs text-ardoise-gris">contacts</span>
                        </div>
                      ) : (
                        <span className="text-ardoise-gris text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        profile.statut_compte === 'actif' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {profile.statut_compte}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
