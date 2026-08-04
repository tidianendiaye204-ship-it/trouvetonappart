import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FormulaireBien from '@/components/FormulaireBien'

export default async function NouveauBienPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-3xl font-black text-quasi-noir mb-6">Publier une nouvelle annonce</h1>
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-ardoise-gris/10">
        <FormulaireBien />
      </div>
    </div>
  )
}
