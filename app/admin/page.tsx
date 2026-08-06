import { createClient } from '@/lib/supabase/server'
import { Activity, Users, Home, ShieldAlert, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: countUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: countBiensAttente } = await supabase
    .from('biens')
    .select('*', { count: 'exact', head: true })
    .eq('statut_moderation', 'en_attente')

  const { count: countBiensTotal } = await supabase
    .from('biens')
    .select('*', { count: 'exact', head: true })

  const { count: countSignalementsNouveaux } = await supabase
    .from('signalements')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'nouveau')

  const { count: countLeads } = await supabase
    .from('contacts_demandes')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2">Dashboard Admin</h1>
        <p className="text-ardoise-gris">Vue d'ensemble de l'activité sur la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider">
              Utilisateurs Total
            </h3>
            <div className="w-10 h-10 bg-indigo-principal/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-principal" />
            </div>
          </div>
          <div className="text-3xl font-black text-quasi-noir">{countUsers || 0}</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider">
              Annonces en base
            </h3>
            <div className="w-10 h-10 bg-safran-accent/10 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-safran-accent" />
            </div>
          </div>
          <div className="text-3xl font-black text-quasi-noir">{countBiensTotal || 0}</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider">
              Annonces à vérifier
            </h3>
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-black text-quasi-noir">{countBiensAttente || 0}</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider">
              Signalements
            </h3>
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="text-3xl font-black text-quasi-noir">{countSignalementsNouveaux || 0}</div>
        </div>

        {/* Card 5 : Preuve de valeur */}
        <Link href="/admin/contacts" className="bg-white rounded-3xl p-6 shadow-lg border border-ardoise-gris/10 md:col-span-2 lg:col-span-4 bg-linear-to-r from-indigo-50 to-purple-50 hover:shadow-xl hover:scale-[1.02] transition-all block cursor-pointer">
          <div className="flex flex-row items-center justify-between pb-2 mb-2">
            <h3 className="text-sm font-bold text-indigo-principal uppercase tracking-wider">
              Contacts & Leads Générés (Preuve de valeur)
            </h3>
            <div className="w-10 h-10 bg-indigo-principal/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-indigo-principal" />
            </div>
          </div>
          <div className="text-4xl font-black text-indigo-principal">{countLeads || 0}</div>
          <p className="text-sm text-ardoise-gris mt-2">Clients ayant contacté un propriétaire via l'application. <span className="font-bold underline text-indigo-principal ml-1">Voir les détails</span></p>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg border-0 mt-8">
        <h2 className="text-xl font-bold text-quasi-noir mb-4">Bienvenue dans l'espace Administration</h2>
        <p className="text-ardoise-gris leading-relaxed max-w-3xl">
          Utilisez le menu latéral pour modérer les annonces des propriétaires, traiter les signalements des locataires et gérer l'accès des utilisateurs.
        </p>
      </div>
    </div>
  )
}
