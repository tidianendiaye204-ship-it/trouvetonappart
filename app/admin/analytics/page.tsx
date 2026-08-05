import { createClient } from '@/lib/supabase/server'
import { BarChart3, Users, MessageSquare, ArrowUpRight, Target } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AnalyticsDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch metrics (In a real app with large data, we would use RPC aggregations. Here we fetch the last 1000 events)
  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  const eventsList = events || []

  const leadsTotal = eventsList.filter(e => e.event_type === 'lead_received').length
  const crmUpdates = eventsList.filter(e => e.event_type === 'lead_status_changed').length
  const botsBlocked = eventsList.filter(e => e.event_type === 'bot_blocked').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-principal" />
          Business Analytics
        </h1>
        <p className="text-ardoise-gris">Suivez les indicateurs clés de performance du SaaS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider">
              Leads Générés
            </h3>
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="text-3xl font-black text-quasi-noir flex items-baseline gap-2">
            {leadsTotal}
            <span className="text-xs text-green-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> +100%</span>
          </div>
          <p className="text-xs text-ardoise-gris mt-2">La valeur brute apportée aux clients.</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider">
              Utilisation du CRM
            </h3>
            <div className="w-10 h-10 bg-indigo-principal/10 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-principal" />
            </div>
          </div>
          <div className="text-3xl font-black text-quasi-noir">{crmUpdates}</div>
          <p className="text-xs text-ardoise-gris mt-2">Changements de statuts de prospects (Engagement).</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider">
              Spam Bloqué
            </h3>
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="text-3xl font-black text-quasi-noir">{botsBlocked}</div>
          <p className="text-xs text-ardoise-gris mt-2">Requêtes arrêtées par le pare-feu applicatif.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg border border-ardoise-gris/10 mt-8">
        <h2 className="text-xl font-bold text-quasi-noir mb-6 border-b border-ardoise-gris/10 pb-4">Flux d'événements récents</h2>
        
        {eventsList.length === 0 ? (
          <p className="text-ardoise-gris text-center py-8">Aucun événement enregistré pour l'instant.</p>
        ) : (
          <div className="space-y-4">
            {eventsList.slice(0, 10).map(evt => (
              <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-sable-fond rounded-xl border border-ardoise-gris/10">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    evt.event_type.includes('lead') ? 'bg-green-100 text-green-800' :
                    evt.event_type.includes('bot') ? 'bg-red-100 text-red-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-medium text-quasi-noir truncate max-w-50 sm:max-w-md">
                    {JSON.stringify(evt.properties)}
                  </span>
                </div>
                <div className="text-xs text-ardoise-gris mt-2 sm:mt-0 font-mono">
                  {new Date(evt.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
