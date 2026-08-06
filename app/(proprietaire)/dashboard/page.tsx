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
        <h1 className="font-display text-3xl sm:text-4xl font-black text-quasi-noir mb-2">Bonjour ! 👋</h1>
        <p className="text-ardoise-gris text-lg">Voici ce qui requiert votre attention aujourd'hui.</p>
      </div>

      {/* SECTION 1 : À FAIRE AUJOURD'HUI (Priorités) */}
      {(nbRetards > 0 || activeLeads > 0) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-ardoise-gris/10">
          <h2 className="font-display text-xl font-bold text-quasi-noir mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            À Faire Aujourd'hui
          </h2>
          <div className="space-y-4">
            
            {nbRetards > 0 && (
              <Link href="/finances" className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-red-50 border border-red-100 hover:border-red-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="bg-white p-3 rounded-xl text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-700 text-lg">{nbRetards} loyer(s) en retard</h3>
                    <p className="text-sm text-red-600/80 mt-0.5">{montantRetard.toLocaleString('fr-FR')} FCFA à recouvrer</p>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-red-700 transition-colors">
                  Relancer les locataires <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )}

            {activeLeads > 0 && (
              <Link href="/demandes" className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-indigo-50 border border-indigo-100 hover:border-indigo-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="bg-white p-3 rounded-xl text-indigo-principal shadow-sm group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-lg">{activeLeads} nouveau(x) contact(s)</h3>
                    <p className="text-sm text-indigo-700/80 mt-0.5">Des clients attendent votre réponse</p>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-principal text-white rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-600 transition-colors">
                  Voir les demandes <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )}

          </div>
        </div>
      )}

      {/* SECTION 2 : ACTIONS RAPIDES (Grandes tuiles cliquables) */}
      <div>
        <h2 className="font-bold text-lg text-quasi-noir mb-4 px-2">Actions Rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <Link href="/mes-annonces/nouveau" className="bg-white p-6 rounded-3xl border border-ardoise-gris/10 shadow-sm hover:shadow-md hover:border-indigo-principal/30 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-principal rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-quasi-noir text-lg mb-1">Ajouter un bien</h3>
            <p className="text-sm text-ardoise-gris">Publier une nouvelle annonce pour trouver un client.</p>
            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-ardoise-gris/30 group-hover:text-indigo-principal group-hover:translate-x-1 transition-all" />
          </Link>

          <Link href="/locataires/nouveau" className="bg-white p-6 rounded-3xl border border-ardoise-gris/10 shadow-sm hover:shadow-md hover:border-green-500/30 transition-all group relative overflow-hidden">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-quasi-noir text-lg mb-1">Nouveau Contrat</h3>
            <p className="text-sm text-ardoise-gris">Enregistrer un locataire et un nouveau bail.</p>
            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-ardoise-gris/30 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link href="/finances/nouveau" className="bg-white p-6 rounded-3xl border border-ardoise-gris/10 shadow-sm hover:shadow-md hover:border-safran-accent/50 transition-all group relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-safran-accent/10 text-safran-accent-dark rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-quasi-noir text-lg mb-1">Enregistrer Paiement</h3>
            <p className="text-sm text-ardoise-gris">Déclarer qu'un locataire a payé son loyer.</p>
            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-ardoise-gris/30 group-hover:text-safran-accent-dark group-hover:translate-x-1 transition-all" />
          </Link>

        </div>
      </div>

      {/* SECTION 3 : STATISTIQUES (KPIs secondaires) */}
      <div className="pt-4 border-t border-ardoise-gris/10">
        <h2 className="font-bold text-lg text-quasi-noir mb-4 px-2">Vue d'ensemble</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl p-5 border border-ardoise-gris/10 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-ardoise-gris uppercase tracking-wider mb-2">Biens</p>
            <h3 className="text-2xl sm:text-3xl font-black text-quasi-noir">{countBiens || 0}</h3>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-ardoise-gris/10 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-ardoise-gris uppercase tracking-wider mb-2">Baux Actifs</p>
            <h3 className="text-2xl sm:text-3xl font-black text-quasi-noir">{countBaux || 0}</h3>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-ardoise-gris/10 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-2 bg-linear-to-br from-indigo-principal to-violet-600 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Automatisations
              </p>
              <h3 className="text-lg font-bold mb-2">Gagnez du temps !</h3>
              <p className="text-sm text-white/80 mb-4 max-w-sm">Activez les relances automatiques pour ne plus courir après vos loyers.</p>
              <Link href="/automations" className="inline-flex items-center gap-2 bg-white text-indigo-principal px-4 py-2 rounded-xl font-bold text-xs hover:scale-105 transition-transform">
                Configurer
              </Link>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
          </div>

        </div>
      </div>

    </div>
  )
}
