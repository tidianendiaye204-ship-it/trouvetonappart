import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import FormBail from './FormBail'

export default async function NouveauBailPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch properties and tenants for the dropdowns
  const { data: biens } = await supabase
    .from('biens')
    .select('id, titre')
    .eq('proprietaire_id', user.id)
    .order('created_at', { ascending: false })

  const { data: locataires } = await supabase
    .from('locataires')
    .select('id, prenom, nom')
    .eq('proprietaire_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/baux" className="text-ardoise-gris hover:text-quasi-noir flex items-center gap-2 text-sm font-medium w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour aux contrats
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-quasi-noir">Nouveau Contrat de Location</h1>
        <p className="text-ardoise-gris mt-1">Associez un locataire à l'un de vos biens immobiliers.</p>
      </div>

      <FormBail biens={biens || []} locataires={locataires || []} />
    </div>
  )
}
