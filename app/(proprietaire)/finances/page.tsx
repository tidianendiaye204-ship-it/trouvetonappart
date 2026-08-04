import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, AlertCircle, Clock, TrendingUp, Wallet, ArrowRight } from 'lucide-react'

export default async function FinancesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Génération automatique des paiements manquants et mise à jour des retards
  await supabase.rpc('generer_paiements_automatiques', { p_proprietaire_id: user.id })

  // Fetch all payments for the current landlord
  // We need to join with baux and biens to filter by proprietaire_id
  const { data: paiements, error } = await supabase
    .from('paiements')
    .select(`
      *,
      baux!inner (
        id,
        locataires (prenom, nom),
        biens!inner (id, titre, proprietaire_id)
      )
    `)
    .eq('baux.biens.proprietaire_id', user.id)
    .order('annee', { ascending: false })
    .order('mois', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erreur de récupération des finances:", error)
  }

  const paiementsList = paiements || []
  
  const moisActuel = new Date().getMonth() + 1
  const anneeActuelle = new Date().getFullYear()

  // Calcul des KPIs
  let totalEncaisseMois = 0
  let totalEnAttenteMois = 0
  let totalRetardsGlobal = 0

  paiementsList.forEach(p => {
    // Retards globaux (tous mois confondus)
    if (p.statut === 'en_retard') {
      totalRetardsGlobal += p.montant
    }
    
    // Stats du mois courant
    if (p.mois === moisActuel && p.annee === anneeActuelle) {
      if (p.statut === 'paye') {
        totalEncaisseMois += p.montant
      } else if (p.statut === 'en_attente') {
        totalEnAttenteMois += p.montant
      }
    }
  })

  const formatMois = (mois: number) => {
    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    return moisNoms[mois - 1]
  }

  const formatMonnaie = (montant: number) => {
    return new Intl.NumberFormat('fr-SN').format(montant)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-quasi-noir">Tableau de bord financier</h1>
          <p className="text-ardoise-gris mt-1">Suivez vos encaissements et les paiements en attente.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-emeraude/10 border border-emeraude/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emeraude/20 rounded-xl text-emeraude">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emeraude uppercase tracking-wider text-sm">Encaissé ce mois</h3>
          </div>
          <p className="font-display font-black text-3xl text-quasi-noir">{formatMonnaie(totalEncaisseMois)} <span className="text-lg text-ardoise-gris">CFA</span></p>
        </div>

        <div className="bg-safran-accent/10 border border-safran-accent/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-safran-accent/20 rounded-xl text-safran-accent">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-safran-accent uppercase tracking-wider text-sm">En attente ce mois</h3>
          </div>
          <p className="font-display font-black text-3xl text-quasi-noir">{formatMonnaie(totalEnAttenteMois)} <span className="text-lg text-ardoise-gris">CFA</span></p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 rounded-xl text-red-500">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-red-500 uppercase tracking-wider text-sm">Retards cumulés</h3>
          </div>
          <p className="font-display font-black text-3xl text-red-600">{formatMonnaie(totalRetardsGlobal)} <span className="text-lg text-red-400">CFA</span></p>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-2xl border border-ardoise-gris/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-ardoise-gris/10 flex justify-between items-center bg-sable-fond/30">
          <h2 className="font-bold text-xl text-quasi-noir">Dernières transactions</h2>
        </div>

        {paiementsList.length === 0 ? (
          <div className="text-center py-16 bg-sable-fond/20">
            <div className="w-16 h-16 bg-white text-ardoise-gris rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-ardoise-gris/10">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="font-display text-lg font-bold text-quasi-noir mb-2">Aucune transaction enregistrée</h3>
            <p className="text-ardoise-gris max-w-md mx-auto">
              Les paiements de vos locataires apparaîtront ici. Créez des contrats pour générer automatiquement les attentes de loyers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sable-fond/50 text-ardoise-gris text-sm uppercase tracking-wider border-b border-ardoise-gris/10">
                  <th className="p-4 font-bold">Période</th>
                  <th className="p-4 font-bold">Bien & Locataire</th>
                  <th className="p-4 font-bold">Montant</th>
                  <th className="p-4 font-bold">Statut</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ardoise-gris/10">
                {paiementsList.map((paiement) => (
                  <tr key={paiement.id} className="hover:bg-sable-fond/20 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-quasi-noir">{formatMois(paiement.mois)} {paiement.annee}</span>
                        {paiement.date_paiement && (
                          <span className="text-xs text-ardoise-gris">le {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <Link href={`/baux/${paiement.bail_id}`} className="font-bold text-indigo-principal hover:underline">
                          {paiement.baux.biens.titre}
                        </Link>
                        <span className="text-sm text-ardoise-gris">
                          {paiement.baux.locataires.prenom} {paiement.baux.locataires.nom}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-black text-quasi-noir">
                      {formatMonnaie(paiement.montant)} CFA
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${
                        paiement.statut === 'paye' ? 'bg-emeraude/10 text-emeraude' : 
                        paiement.statut === 'en_retard' ? 'bg-red-100 text-red-600' : 'bg-safran-accent/10 text-safran-accent'
                      }`}>
                        {paiement.statut === 'paye' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {paiement.statut === 'en_retard' && <AlertCircle className="w-3.5 h-3.5" />}
                        {paiement.statut === 'en_attente' && <Clock className="w-3.5 h-3.5" />}
                        {paiement.statut.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {paiement.statut === 'paye' && (
                          <Link 
                            href={`/baux/${paiement.bail_id}/quittance/${paiement.id}`}
                            className="text-xs font-bold bg-indigo-principal/10 text-indigo-principal px-3 py-1.5 rounded-full hover:bg-indigo-principal hover:text-white transition-colors"
                          >
                            Quittance
                          </Link>
                        )}
                        {paiement.statut === 'en_retard' && (
                          <a 
                            href={`mailto:${paiement.baux.locataires.email || ''}?subject=Relance%20-%20Loyer%20de%20${formatMois(paiement.mois)}&body=Bonjour%20${paiement.baux.locataires.prenom},%0D%0A%0D%0ASauf%20erreur%20de%20notre%20part,%20le%20loyer%20de%20${formatMois(paiement.mois)}%20${paiement.annee}%20d'un%20montant%20de%20${paiement.montant}%20CFA%20n'a%20pas%20encore%20%C3%A9t%C3%A9%20r%C3%A9gl%C3%A9.%0D%0AMerci%20de%20r%C3%A9gulariser%20la%20situation%20d%C3%A8s%20que%20possible.%0D%0A%0D%0ACordialement.`}
                            className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                          >
                            Relancer
                          </a>
                        )}
                        {paiement.statut === 'en_attente' && (
                          <Link 
                            href={`/baux/${paiement.bail_id}`}
                            className="text-xs font-bold bg-sable-fond text-quasi-noir px-3 py-1.5 rounded-full hover:bg-ardoise-gris/20 transition-colors"
                          >
                            Détails
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
