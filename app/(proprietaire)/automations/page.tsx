import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Bell, CheckCircle2, XCircle, Mail, MessageCircle, Clock, Settings2 } from 'lucide-react'
import AutomationsClient from './AutomationsClient'

export default async function AutomationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Charger les préférences (créer si n'existe pas)
  let { data: preferences } = await supabase
    .from('automations_preferences')
    .select('*')
    .eq('profil_id', user.id)
    .single()

  if (!preferences) {
    const { data: newPref } = await supabase
      .from('automations_preferences')
      .insert({ profil_id: user.id })
      .select()
      .single()
    preferences = newPref
  }

  // 2. Charger l'historique
  const { data: history } = await supabase
    .from('automations_history')
    .select('*')
    .eq('profil_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      <div>
        <h1 className="font-display text-3xl font-black text-quasi-noir mb-2 flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-indigo-principal" /> Automatisations
        </h1>
        <p className="text-ardoise-gris">Gérez l'envoi automatique de rappels pour vos loyers et vos prospects.</p>
      </div>

      <AutomationsClient initialPreferences={preferences} initialHistory={history || []} />
      
    </div>
  )
}
