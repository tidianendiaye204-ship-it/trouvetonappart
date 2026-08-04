import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CarteBienAdmin from '@/components/CarteBienAdmin'
import BoutonRetour from '@/components/BoutonRetour'
import { PlusCircle, MessageSquare, Home, BarChart3, Users, UserPlus, FileText, AlertTriangle, ArrowRight, Wallet, Star } from 'lucide-react'
import { getBiensProprietaire } from '@/lib/services/bien.service'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch properties
  const biens = await getBiensProprietaire(user.id)

  const totalBiens = biens?.length || 0;
  const biensPublies = biens?.filter(b => b.publie).length || 0;

  // 2. Fetch Locataires
  const { count: locatairesCount } = await supabase
    .from('locataires')
    .select('*', { count: 'exact', head: true })
    .eq('proprietaire_id', user.id)

  const totalLocataires = locatairesCount || 0;

  // 3. Fetch all demands to calculate total, hot prospects and top properties
  const { data: demandes } = await supabase
    .from('contacts_demandes')
    .select('*, biens!inner(id, titre, proprietaire_id)')
    .eq('biens.proprietaire_id', user.id)
    .order('created_at', { ascending: false })

  const totalContacts = demandes?.length || 0;
  
  // Prospects chauds (nouveau ou a_relancer)
  const prospectsChauds = (demandes || [])
    .filter(d => d.statut === 'nouveau' || d.statut === 'a_relancer')
    .slice(0, 4) // On en garde max 4 pour l'UI

  // Biens les plus populaires
  const demandeCounts: Record<string, { count: number, titre: string }> = {}
  demandes?.forEach(d => {
    const bId = d.biens.id
    if (!demandeCounts[bId]) demandeCounts[bId] = { count: 0, titre: d.biens.titre }
    demandeCounts[bId].count += 1
  })
  
  const topBiens = Object.entries(demandeCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // 4. Fetch Finances
  const moisActuel = new Date().getMonth() + 1
  const anneeActuelle = new Date().getFullYear()

  const { data: paiements } = await supabase
    .from('paiements')
    .select(`id, montant, statut, mois, annee, baux!inner(biens!inner(proprietaire_id))`)
    .eq('baux.biens.proprietaire_id', user.id)

  let totalEncaisseMois = 0
  let totalEnAttenteMois = 0
  let retards = 0
  let totalRetard = 0

  if (paiements) {
    paiements.forEach(p => {
      // Statistiques du mois courant
      if (p.mois === moisActuel && p.annee === anneeActuelle) {
        if (p.statut === 'paye') totalEncaisseMois += p.montant
        if (p.statut === 'en_attente') totalEnAttenteMois += p.montant
      }
      
      // Retards (tous les mois) - on considère qu'un paiement en_attente d'un mois passé est en retard
      // Ou si vous avez un statut spécifique 'en_retard', on l'utilise
      const isPastMonth = p.annee < anneeActuelle || (p.annee === anneeActuelle && p.mois < moisActuel)
      if (p.statut === 'en_retard' || (p.statut === 'en_attente' && isPastMonth)) {
        retards += 1
        totalRetard += p.montant
      }
    })
  }

  const biensAffiches = biens || []

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <BoutonRetour />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-quasi-noir tracking-tight">Vue d'ensemble</h1>
          <p className="text-ardoise-gris mt-3 text-lg font-medium">Votre activité immobilière en temps réel.</p>
        </div>
        
        {/* Actions Rapides Pylules */}
        <div className="flex flex-wrap gap-3">
          <Link href="/mes-annonces/nouveau" className="flex items-center gap-2 rounded-full bg-quasi-noir text-white px-5 py-2.5 text-sm font-bold shadow-md hover:scale-105 transition-transform">
            <PlusCircle className="w-4 h-4" /> Ajouter un bien
          </Link>
          <Link href="/locataires" className="flex items-center gap-2 rounded-full bg-safran-accent text-quasi-noir px-5 py-2.5 text-sm font-bold shadow-sm hover:scale-105 transition-transform">
            <Users className="w-4 h-4" /> Mes Locataires
          </Link>
          <Link href="/baux" className="flex items-center gap-2 rounded-full bg-white border border-ardoise-gris/20 text-quasi-noir px-5 py-2.5 text-sm font-bold hover:bg-sable-fond transition-colors shadow-sm">
            <FileText className="w-4 h-4" /> Mes Contrats
          </Link>
          <Link href="/profil" className="flex items-center gap-2 rounded-full bg-white border border-ardoise-gris/20 text-quasi-noir px-5 py-2.5 text-sm font-bold hover:bg-sable-fond transition-colors shadow-sm">
            <Users className="w-4 h-4" /> Mon Profil
          </Link>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-12">
        
        {/* BIG KPI: Revenus */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-white rounded-3xl p-8 border border-ardoise-gris/10 shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-principal/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 bg-indigo-principal/10 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-indigo-principal" />
            </div>
            <span className="text-xs font-bold text-ardoise-gris bg-sable-fond px-3 py-1 rounded-full uppercase tracking-wider">Ce mois-ci</span>
          </div>
          <div>
            <p className="text-sm font-medium text-ardoise-gris mb-1">Revenus encaissés</p>
            <h3 className="font-display text-4xl font-black text-quasi-noir">
              {new Intl.NumberFormat('fr-SN', { notation: 'compact', maximumFractionDigits: 1 }).format(totalEncaisseMois)} <span className="text-xl text-ardoise-gris">CFA</span>
            </h3>
            {totalEnAttenteMois > 0 && (
              <p className="text-sm font-medium text-safran-accent mt-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-safran-accent"></span>
                {new Intl.NumberFormat('fr-SN').format(totalEnAttenteMois)} CFA en attente
              </p>
            )}
          </div>
        </div>

        {/* ALERTE: Retards */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#FFF5F5] rounded-3xl p-8 border border-red-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <Link href="/baux" className="text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full uppercase tracking-wider transition-colors flex items-center gap-1">
              Gérer <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800/70 mb-1">Paiements en retard</p>
            <h3 className="font-display text-4xl font-black text-red-600">
              {retards} <span className="text-xl font-medium">dossier{retards > 1 ? 's' : ''}</span>
            </h3>
            {totalRetard > 0 && (
              <p className="text-sm font-bold text-red-700 mt-3">
                Soit {new Intl.NumberFormat('fr-SN').format(totalRetard)} CFA à récupérer
              </p>
            )}
            {retards === 0 && (
              <p className="text-sm font-medium text-emeraude mt-3">Tout est à jour !</p>
            )}
          </div>
        </div>

        {/* KPI: Biens & Taux */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-quasi-noir rounded-3xl p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Home className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/60 mb-1">Parc immobilier</p>
            <h3 className="font-display text-4xl font-black text-white">
              {totalBiens} <span className="text-xl font-medium text-white/80">biens</span>
            </h3>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
              <span className="text-white/60">Publiés</span>
              <span className="text-white font-bold">{biensPublies}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-white/60">Locataires actifs</span>
              <span className="text-white font-bold">{totalLocataires}</span>
            </div>
          </div>
        </div>

      </div>

      {/* DEUXIEME LIGNE DU BENTO : CRM & TOP BIENS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
        
        {/* PROSPECTS CHAUDS */}
        <div className="col-span-1 lg:col-span-7 bg-white rounded-3xl p-8 border border-ardoise-gris/10 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="font-display text-xl font-bold text-quasi-noir">Clients potentiels à relancer</h2>
            </div>
            <Link href="/demandes" className="text-sm font-bold text-indigo-principal hover:underline flex items-center gap-1">
              Voir tout ({totalContacts}) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {prospectsChauds.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-sable-fond rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-emeraude" />
                </div>
                <p className="text-ardoise-gris font-medium text-sm">Toutes vos demandes sont traitées.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prospectsChauds.map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-4 rounded-2xl bg-sable-fond/50 border border-ardoise-gris/10 hover:bg-sable-fond transition-colors">
                    <div>
                      <p className="font-bold text-quasi-noir text-sm">{prospect.nom_demandeur}</p>
                      <p className="text-xs text-ardoise-gris truncate max-w-50 sm:max-w-xs mt-0.5">Pour : {prospect.biens?.titre}</p>
                    </div>
                    <Link href={`tel:${prospect.telephone_demandeur}`} className="px-4 py-2 bg-white border border-ardoise-gris/20 rounded-xl text-xs font-bold text-indigo-principal shadow-sm hover:border-indigo-principal/30 transition-all">
                      Appeler
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOP BIENS */}
        <div className="col-span-1 lg:col-span-5 bg-white rounded-3xl p-8 border border-ardoise-gris/10 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-safran-accent/10 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-safran-accent" />
            </div>
            <h2 className="font-display text-xl font-bold text-quasi-noir">Annonces Stars</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {topBiens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ardoise-gris font-medium text-sm">Pas encore de données de popularité.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topBiens.map((bien, index) => (
                  <div key={bien.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-safran-accent text-white' : 'bg-sable-fond text-ardoise-gris'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-quasi-noir text-sm truncate">{bien.titre}</p>
                      <div className="w-full bg-sable-fond h-2 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-indigo-principal h-full rounded-full" 
                          style={{ width: `${(bien.count / topBiens[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-quasi-noir text-sm">{bien.count}</p>
                      <p className="text-[10px] text-ardoise-gris uppercase font-bold tracking-wider">Demandes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LISTE DES BIENS */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-2xl font-black text-quasi-noir">Gérer mes biens</h2>
        </div>

        {biensAffiches.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-ardoise-gris/30 flex flex-col items-center">
            <div className="w-20 h-20 bg-sable-fond rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Home className="w-10 h-10 text-ardoise-gris/50" />
            </div>
            <h3 className="font-display text-2xl font-black text-quasi-noir mb-3">Votre portefeuille est vide</h3>
            <p className="text-ardoise-gris mb-8 max-w-md text-base">
              Le secret des grands investisseurs commence toujours par une première propriété. Ajoutez-la pour débloquer toute la puissance du dashboard.
            </p>
            <Link href="/mes-annonces/nouveau" className="inline-flex items-center gap-2 rounded-full bg-quasi-noir text-white px-8 py-3.5 font-bold shadow-xl hover:scale-105 transition-all">
              <PlusCircle className="w-5 h-5" />
              Ajouter mon premier bien
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {biensAffiches.map((bien) => (
              <CarteBienAdmin key={bien.id} bien={bien} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
