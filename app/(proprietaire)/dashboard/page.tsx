import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Building, Users, Wallet, AlertCircle, FileText, ArrowRight, Settings2 } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. STATS BIENS
  const { count: countBiens } = await supabase
    .from('biens')
    .select('*', { count: 'exact', head: true })
    .eq('proprietaire_id', user.id)

  // 2. STATS BAUX ACTIFS
  const { count: countBaux } = await supabase
    .from('baux')
    .select('*', { count: 'exact', head: true })
    .eq('proprietaire_id', user.id)
    .eq('statut', 'actif')

  // 3. LEADS (Demandes CRM)
  const { data: leads } = await supabase
    .from('contacts_demandes')
    .select('id, statut, prochaine_relance, biens!inner(proprietaire_id)')
    .eq('biens.proprietaire_id', user.id)
    .not('statut', 'in', '("converti","perdu")')
  
  const activeLeads = leads?.length || 0

  // 4. LOYERS (Exemple simplifié si la structure paiements existe)
  // On récupère les paiements en retard (impayés + date passée)
  const today = new Date().toISOString()
  const { data: retards } = await supabase
    .from('paiements')
    .select('id, montant, baux!inner(proprietaire_id)')
    .eq('baux.proprietaire_id', user.id)
    .eq('statut', 'impaye')
    .lt('date_echeance', today)

  const nbRetards = retards?.length || 0
  const montantRetard = retards?.reduce((acc, curr) => acc + Number(curr.montant), 0) || 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-black text-quasi-noir mb-2">Bienvenue sur votre Espace Pro</h1>
        <p className="text-ardoise-gris">Voici un résumé de votre activité immobilière aujourd'hui.</p>
      </div>

      {/* KPI BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* KPI 1 : Biens */}
        <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-principal">
              <Building className="w-6 h-6" />
            </div>
            <Link href="/mes-annonces" className="text-ardoise-gris hover:text-indigo-principal opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div>
            <h3 className="text-3xl font-black text-quasi-noir">{countBiens || 0}</h3>
            <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mt-1">Biens Gérés</p>
          </div>
        </div>

        {/* KPI 2 : Locataires / Baux */}
        <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <FileText className="w-6 h-6" />
            </div>
            <Link href="/baux" className="text-ardoise-gris hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div>
            <h3 className="text-3xl font-black text-quasi-noir">{countBaux || 0}</h3>
            <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mt-1">Contrats Actifs</p>
          </div>
        </div>

        {/* KPI 3 : Demandes */}
        <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <Link href="/demandes" className="text-ardoise-gris hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div>
            <h3 className="text-3xl font-black text-quasi-noir">{activeLeads}</h3>
            <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mt-1">Demandes en cours</p>
          </div>
        </div>

        {/* KPI 4 : Alertes Retards */}
        <div className={`rounded-2xl p-6 border shadow-sm transition-shadow group flex flex-col justify-between ${nbRetards > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-ardoise-gris/10 hover:shadow-md'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${nbRetards > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <Link href="/finances" className="text-ardoise-gris hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div>
            <h3 className={`text-3xl font-black ${nbRetards > 0 ? 'text-red-600' : 'text-quasi-noir'}`}>{nbRetards}</h3>
            <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mt-1">Loyers en retard</p>
            {nbRetards > 0 && (
              <p className="text-xs font-bold text-red-500 mt-2">{montantRetard.toLocaleString('fr-FR')} FCFA à recouvrer</p>
            )}
          </div>
        </div>

      </div>

      {/* SECTION VUE SYNTHETIQUE MENSUELLE */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Raccourcis Actions */}
        <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm">
          <h2 className="font-bold text-lg text-quasi-noir mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            <Link href="/mes-annonces" className="flex items-center gap-4 p-4 rounded-xl hover:bg-sable-fond transition-colors border border-transparent hover:border-ardoise-gris/10">
              <div className="bg-indigo-50 text-indigo-principal p-2 rounded-lg">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-quasi-noir">Ajouter un bien</p>
                <p className="text-xs text-ardoise-gris">Publier une nouvelle annonce</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ardoise-gris" />
            </Link>

            <Link href="/locataires" className="flex items-center gap-4 p-4 rounded-xl hover:bg-sable-fond transition-colors border border-transparent hover:border-ardoise-gris/10">
              <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-quasi-noir">Nouveau Contrat</p>
                <p className="text-xs text-ardoise-gris">Créer un contrat ou ajouter un locataire</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ardoise-gris" />
            </Link>
          </div>
        </div>

        {/* Info / Conseil du mois */}
        <div className="bg-linear-to-br from-indigo-principal to-violet-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-bold text-lg mb-2">Automatisations</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Saviez-vous que vous pouvez relancer automatiquement vos locataires en retard et vos prospects via WhatsApp ou Email ?
            </p>
            <Link href="/automations" className="inline-flex items-center gap-2 bg-white text-indigo-principal px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform">
              <Settings2 className="w-4 h-4" /> Configurer
            </Link>
          </div>
          {/* Cercles décoratifs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 right-10 -mb-10 w-32 h-32 rounded-full bg-black/10 blur-xl"></div>
        </div>
      </div>
    </div>
  )
}
