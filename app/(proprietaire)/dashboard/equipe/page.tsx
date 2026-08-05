import { createClient } from '@/lib/supabase/server'
import { Users, UserPlus, Shield, Building2, ChevronRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import CreerAgenceForm from './CreerAgenceForm'
import InviterMembreForm from './InviterMembreForm'

export default async function EquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérifier si l'utilisateur appartient déjà à une agence
  const { data: membre } = await supabase
    .from('agence_membres')
    .select('role, agences(*)')
    .eq('user_id', user.id)
    .single()

  if (!membre) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 mt-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-principal/10 text-indigo-principal rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-quasi-noir">Passez en mode Agence</h1>
          <p className="text-ardoise-gris mt-2">
            Collaborez avec votre équipe. Partagez vos biens, vos prospects et déléguez la gestion (Agents, Comptables).
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-ardoise-gris/10">
          <CreerAgenceForm />
        </div>
      </div>
    )
  }

  const agence = (membre.agences as any)

  // Récupérer les membres de cette agence
  const { data: collaborateurs } = await supabase
    .from('agence_membres')
    .select('role, profiles:user_id(nom, telephone, id)')
    .eq('agence_id', agence.id)

  const isAdmin = membre.role === 'admin'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-principal" />
          Mon Équipe
        </h1>
        <p className="text-ardoise-gris flex items-center gap-2 mt-2">
          Agence : <strong className="text-quasi-noir">{agence.nom}</strong>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full font-bold uppercase">
            {membre.role}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Liste des membres */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-lg border border-ardoise-gris/10 overflow-hidden">
            <div className="p-6 border-b border-ardoise-gris/10">
              <h2 className="text-xl font-bold text-quasi-noir">Collaborateurs</h2>
            </div>
            <ul className="divide-y divide-ardoise-gris/10">
              {collaborateurs?.map((collab: any) => (
                <li key={collab.profiles.id} className="p-6 flex items-center justify-between hover:bg-sable-fond transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-principal font-bold">
                      {collab.profiles.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-quasi-noir">{collab.profiles.nom}</p>
                      <p className="text-xs text-ardoise-gris">{collab.profiles.telephone || 'Aucun numéro'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase text-ardoise-gris bg-white border border-ardoise-gris/20 px-3 py-1 rounded-full flex items-center gap-1">
                      {collab.role === 'admin' && <Shield className="w-3 h-3 text-red-500" />}
                      {collab.role}
                    </span>
                    {isAdmin && collab.profiles.id !== user.id && (
                      <button className="text-ardoise-gris hover:text-red-500">
                        Retirer
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Panneau d'invitation */}
        <div>
          {isAdmin ? (
            <div className="bg-quasi-noir text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Inviter un membre
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Envoyez un lien d'invitation sécurisé à votre collaborateur.
              </p>
              <InviterMembreForm agenceId={agence.id} />
            </div>
          ) : (
            <div className="bg-sable-fond rounded-3xl p-6 border border-ardoise-gris/10 text-center">
              <Shield className="w-8 h-8 text-ardoise-gris mx-auto mb-3" />
              <p className="text-sm text-ardoise-gris">
                Seul l'administrateur de l'agence peut inviter de nouveaux collaborateurs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
