import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, PlusCircle, ArrowLeft } from 'lucide-react'

export default async function BauxPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Génération automatique des paiements pour s'assurer que les stats/statuts sont à jour
  await supabase.rpc('generer_paiements_automatiques', { p_proprietaire_id: user.id })

  const { data: baux } = await supabase
    .from('baux')
    .select(`
      *,
      biens(titre),
      locataires(prenom, nom)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/mes-annonces" className="text-ardoise-gris hover:text-quasi-noir flex items-center gap-2 text-sm font-medium w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-quasi-noir">Mes Contrats</h1>
          <p className="text-ardoise-gris mt-1">Gérez vos contrats de location en cours et passés.</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/baux/nouveau"
            className="flex items-center gap-2 rounded-full bg-indigo-principal text-white px-6 py-2.5 font-bold shadow-md hover:brightness-110 transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            Nouveau Contrat
          </Link>
        </div>
      </div>

      {!baux || baux.length === 0 ? (
        <div className="text-center py-20 bg-sable-fond/50 rounded-3xl border border-dashed border-ardoise-gris/30">
          <div className="w-16 h-16 bg-white text-ardoise-gris rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-quasi-noir mb-2">Aucun contrat enregistré</h3>
          <p className="text-ardoise-gris mb-6 max-w-md mx-auto">
            Créez votre premier contrat en associant un de vos locataires à l'un de vos biens immobiliers.
          </p>
          <Link href="/baux/nouveau" className="inline-flex items-center gap-2 rounded-full bg-indigo-principal text-white px-6 py-2.5 font-bold shadow-md hover:brightness-110 transition-all">
            <PlusCircle className="w-5 h-5" />
            Créer un contrat
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-ardoise-gris">
            <thead className="bg-sable-fond border-b border-ardoise-gris/10 text-quasi-noir">
              <tr>
                <th className="px-6 py-4 font-bold font-display">Locataire</th>
                <th className="px-6 py-4 font-bold font-display">Bien loué</th>
                <th className="px-6 py-4 font-bold font-display">Loyer (CFA)</th>
                <th className="px-6 py-4 font-bold font-display">Période</th>
                <th className="px-6 py-4 font-bold font-display">Statut</th>
                <th className="px-6 py-4 font-bold font-display text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {baux.map((bail: any) => (
                <tr key={bail.id} className="hover:bg-sable-fond/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-quasi-noir">{bail.locataires?.prenom} {bail.locataires?.nom}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-quasi-noir font-medium">{bail.biens?.titre}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emeraude">
                    {new Intl.NumberFormat('fr-SN').format(bail.loyer_mensuel)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-ardoise-gris whitespace-nowrap">
                      Du : {new Date(bail.date_debut).toLocaleDateString('fr-FR')}
                      <br/>
                      Au : {bail.date_fin ? new Date(bail.date_fin).toLocaleDateString('fr-FR') : 'Indéterminé'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${
                      bail.statut === 'actif' ? 'bg-emeraude/10 text-emeraude border-emeraude/20' : 
                      bail.statut === 'termine' ? 'bg-ardoise-gris/10 text-ardoise-gris border-ardoise-gris/20' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {bail.statut.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/baux/${bail.id}`} className="text-indigo-principal hover:underline font-bold text-sm">
                      Détails & Paiements
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
