import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTransactionsSponsoring, getRevenusSponsoring } from '@/lib/services/sponsoring.service'
import BoutonRetour from '@/components/BoutonRetour'
import { formatMontant } from '@/lib/sponsoring/config'
import { Star, ArrowUpRight, Clock, XCircle, CheckCircle2 } from 'lucide-react'

export default async function HistoriqueSponsorisationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const transactions = await getTransactionsSponsoring(user.id)
  const revenus = await getRevenusSponsoring(user.id)

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emeraude/10 text-emeraude text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Payé</span>
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-safran-accent/10 text-safran-accent text-xs font-bold"><Clock className="w-3 h-3" /> En attente</span>
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold"><XCircle className="w-3 h-3" /> Échoué</span>
      case 'expired':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ardoise-gris/10 text-ardoise-gris text-xs font-bold"><Clock className="w-3 h-3" /> Expiré</span>
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">{statut}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <BoutonRetour />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-quasi-noir tracking-tight">
            Sponsorisations
          </h1>
          <p className="text-ardoise-gris mt-3 text-lg font-medium">Historique de vos mises en avant.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 border border-ardoise-gris/10 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emeraude/10 rounded-2xl flex items-center justify-center">
            <Star className="w-7 h-7 text-emeraude" />
          </div>
          <div>
            <p className="text-sm font-medium text-ardoise-gris mb-1">Total Investi</p>
            <h3 className="font-display text-2xl font-black text-quasi-noir">
              {formatMontant(revenus.revenus_totaux)}
            </h3>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-ardoise-gris/10 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-principal/10 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-indigo-principal" />
          </div>
          <div>
            <p className="text-sm font-medium text-ardoise-gris mb-1">Transactions Réussies</p>
            <h3 className="font-display text-2xl font-black text-quasi-noir">
              {revenus.total_transactions_payees}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-ardoise-gris/10 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-safran-accent/10 rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-safran-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-ardoise-gris mb-1">En attente / Échouées</p>
            <h3 className="font-display text-2xl font-black text-quasi-noir">
              {revenus.transactions_en_attente + revenus.transactions_echouees}
            </h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-ardoise-gris/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sable-fond/50 border-b border-ardoise-gris/10">
                <th className="py-4 px-6 text-xs font-bold text-ardoise-gris uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-bold text-ardoise-gris uppercase tracking-wider">Bien</th>
                <th className="py-4 px-6 text-xs font-bold text-ardoise-gris uppercase tracking-wider">Plan</th>
                <th className="py-4 px-6 text-xs font-bold text-ardoise-gris uppercase tracking-wider">Montant</th>
                <th className="py-4 px-6 text-xs font-bold text-ardoise-gris uppercase tracking-wider">Statut</th>
                <th className="py-4 px-6 text-xs font-bold text-ardoise-gris uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ardoise-gris">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-sable-fond/30 transition-colors">
                    <td className="py-4 px-6 text-sm text-quasi-noir">
                      {new Date(trx.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-sm text-quasi-noir">{trx.biens?.titre || 'Bien inconnu'}</p>
                      <p className="text-xs text-ardoise-gris">{trx.biens?.ville || ''}</p>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-quasi-noir">
                      {trx.plan_jours} jours
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-quasi-noir">
                      {formatMontant(trx.montant)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(trx.statut)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {trx.statut === 'paid' ? (
                        <Link 
                          href={`/annonce/${trx.bien_id}`} 
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-principal hover:underline"
                        >
                          Voir <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      ) : trx.statut === 'pending' || trx.statut === 'failed' ? (
                        <Link 
                          href={`/mes-annonces/${trx.bien_id}/sponsoriser`} 
                          className="inline-flex items-center gap-1 text-xs font-bold text-safran-accent hover:underline"
                        >
                          Réessayer
                        </Link>
                      ) : (
                        <span className="text-xs text-ardoise-gris">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
