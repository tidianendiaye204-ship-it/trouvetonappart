import { createClient } from '@/lib/supabase/server'
import { Bien } from '@/types'
import ClientAnnoncesTable from './ClientAnnoncesTable'

export default async function AdminAnnoncesPage() {
  const supabase = await createClient()

  // On récupère toutes les annonces, y compris non publiées, avec les infos proprio
  const { data: annonces, error } = await supabase
    .from('biens')
    .select(`
      *,
      profiles!proprietaire_id(nom, telephone)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Erreur de chargement des annonces: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2">Modération des Annonces</h1>
        <p className="text-ardoise-gris">Validez, rejetez ou suspendez les annonces publiées.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden p-2">
        <ClientAnnoncesTable initialAnnonces={annonces as any[]} />
      </div>
    </div>
  )
}
