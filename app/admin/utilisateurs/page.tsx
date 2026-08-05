import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'
import ClientUsersTable from './ClientUsersTable'

export default async function AdminUtilisateursPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Erreur de chargement des utilisateurs: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2">Gestion des Utilisateurs</h1>
        <p className="text-ardoise-gris">Suspendez des comptes ou modifiez les rôles.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
        <ClientUsersTable initialUsers={users as Profile[]} />
      </div>
    </div>
  )
}
