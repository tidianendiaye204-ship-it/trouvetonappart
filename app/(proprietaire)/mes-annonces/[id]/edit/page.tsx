import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FormulaireBien from '@/components/FormulaireBien'

export default async function EditBienPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bien, error } = await supabase
    .from('biens')
    .select(`
      *,
      biens_images ( id, url, ordre )
    `)
    .eq('id', id)
    .single()

  if (error || !bien) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Bien introuvable</h1>
        <p className="text-gray-600">Ce bien n'existe pas ou vous n'avez pas l'autorisation de le modifier.</p>
      </div>
    )
  }

  // Verification that the current user is the owner
  if (bien.proprietaire_id !== user.id) {
    redirect('/mes-annonces')
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-3xl font-black text-quasi-noir mb-6">Modifier l'annonce</h1>
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-ardoise-gris/10">
        <FormulaireBien bien={bien} />
      </div>
    </div>
  )
}
