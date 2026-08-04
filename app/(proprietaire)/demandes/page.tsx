import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DemandesCRM from '@/components/DemandesCRM'

export default async function DemandesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer les demandes pour les biens du propriétaire
  const { data: demandes } = await supabase
    .from('contacts_demandes')
    .select('*, biens!inner(titre, proprietaire_id)')
    .eq('biens.proprietaire_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-quasi-noir mb-2">Gestion des demandes</h1>
        <p className="text-ardoise-gris">Suivez et convertissez vos prospects immobiliers.</p>
      </div>
      
      <DemandesCRM initialDemandes={demandes || []} />
    </div>
  )
}
