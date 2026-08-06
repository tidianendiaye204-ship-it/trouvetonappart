import { createClient } from '@/lib/supabase/server'
import { Signalement } from '@/types'
import ClientSignalementsTable from './ClientSignalementsTable'

export default async function AdminSignalementsPage() {
  const supabase = await createClient()

  const { data: signalements, error } = await supabase
    .from('signalements')
    .select(`
      *,
      biens(titre, ville, proprietaire_id),
      profiles(nom)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Erreur de chargement des signalements: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2">Signalements</h1>
        <p className="text-ardoise-gris">Gérez les rapports de la communauté concernant les annonces.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden p-2">
        <ClientSignalementsTable initialSignalements={signalements as any[]} />
      </div>
    </div>
  )
}
