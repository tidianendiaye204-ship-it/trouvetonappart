import { createClient } from '@/lib/supabase/server'
import { Wallet } from 'lucide-react'

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  const { data: loyers } = await supabase
    .from('transactions_loyers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // On suppose que la table de sponsorisation s'appelle 'transactions_sponsoring'
  let sponsos: any[] = []
  try {
    const { data } = await supabase
      .from('transactions_sponsoring')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) sponsos = data
  } catch (err) {
    // Ignore, la table n'existe peut-être pas
  }

  const formatCFA = (montant: number) => new Intl.NumberFormat('fr-SN').format(montant)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2">Transactions</h1>
        <p className="text-ardoise-gris">Vue d'ensemble des 50 dernières transactions (Loyers & Sponsorisation).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Loyers */}
        <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-ardoise-gris/10 bg-sable-fond/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-principal/10 rounded-full flex items-center justify-center text-indigo-principal">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-quasi-noir">Loyers en Ligne</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-ardoise-gris border-b border-ardoise-gris/10">
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Montant</th>
                  <th className="pb-3 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ardoise-gris/5">
                {loyers?.length ? loyers.map((t: any) => (
                  <tr key={t.id}>
                    <td className="py-3">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 font-bold">{formatCFA(t.montant)} CFA</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        t.statut === 'paid' ? 'bg-emeraude/10 text-emeraude' : 'bg-safran-accent/20 text-quasi-noir'
                      }`}>
                        {t.statut}
                      </span>
                    </td>
                  </tr>
                )) : <tr><td colSpan={3} className="py-4 text-center text-ardoise-gris">Aucune transaction</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sponsorisation */}
        <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
          <div className="p-6 border-b border-ardoise-gris/10 bg-sable-fond/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-safran-accent/10 rounded-full flex items-center justify-center text-safran-accent">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-quasi-noir">Sponsorisation</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-ardoise-gris border-b border-ardoise-gris/10">
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Montant</th>
                  <th className="pb-3 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ardoise-gris/5">
                {sponsos?.length ? sponsos.map((t: any) => (
                  <tr key={t.id}>
                    <td className="py-3">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 font-bold">{formatCFA(t.montant)} CFA</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        t.statut === 'paid' ? 'bg-emeraude/10 text-emeraude' : 'bg-safran-accent/20 text-quasi-noir'
                      }`}>
                        {t.statut}
                      </span>
                    </td>
                  </tr>
                )) : <tr><td colSpan={3} className="py-4 text-center text-ardoise-gris">Aucune transaction</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
