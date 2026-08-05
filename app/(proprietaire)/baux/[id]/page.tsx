import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import FormPaiement from './FormPaiement'
import BoutonSupprimerBail from '@/components/BoutonSupprimerBail'
import BoutonLienPaiement from '@/components/BoutonLienPaiement'
import BoutonWhatsApp from '@/components/BoutonWhatsApp'

export default async function BailDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bail } = await supabase
    .from('baux')
    .select(`
      *,
      biens(titre, adresse),
      locataires(prenom, nom, telephone, email)
    `)
    .eq('id', id)
    .single()

  if (!bail) {
    return <div className="p-8 text-center text-red-500 font-bold">Contrat introuvable.</div>
  }

  const { data: paiements } = await supabase
    .from('paiements')
    .select('*')
    .eq('bail_id', bail.id)
    .order('annee', { ascending: false })
    .order('mois', { ascending: false })

  const formatMois = (mois: number) => {
    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    return moisNoms[mois - 1]
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/baux" className="text-ardoise-gris hover:text-quasi-noir flex items-center gap-2 text-sm font-medium w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour aux contrats
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm mb-8">
        <div className="p-6 md:p-8 border-b border-ardoise-gris/10 bg-sable-fond/50 flex justify-between items-start">
          <div>
            <h1 className="font-display text-2xl font-black text-quasi-noir mb-2">Contrat de location</h1>
            <p className="text-ardoise-gris font-medium">{bail.biens?.titre}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 text-sm font-bold rounded-full ${
              bail.statut === 'actif' ? 'bg-emeraude/10 text-emeraude' : 
              bail.statut === 'termine' ? 'bg-ardoise-gris/10 text-ardoise-gris' : 'bg-red-100 text-red-600'
            }`}>
              {bail.statut.toUpperCase()}
            </span>
            <BoutonSupprimerBail id={bail.id} />
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-4">Informations Locataire</h3>
            <div className="bg-sable-fond p-4 rounded-xl border border-ardoise-gris/10">
              <p className="font-bold text-quasi-noir text-lg">{bail.locataires?.prenom} {bail.locataires?.nom}</p>
              <p className="text-ardoise-gris mt-2">{bail.locataires?.telephone}</p>
              {bail.locataires?.email && <p className="text-ardoise-gris">{bail.locataires?.email}</p>}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-4">Détails Financiers</h3>
            <div className="bg-indigo-principal/5 p-4 rounded-xl border border-indigo-principal/10 text-indigo-principal">
              <p className="text-sm font-medium mb-1 text-indigo-principal/70">Loyer Mensuel</p>
              <p className="font-display font-black text-2xl">{new Intl.NumberFormat('fr-SN').format(bail.loyer_mensuel)} CFA</p>
              <div className="mt-4 text-sm font-medium text-indigo-principal/80">
                <p>Début : {new Date(bail.date_debut).toLocaleDateString('fr-FR')}</p>
                {bail.date_fin && <p>Fin : {new Date(bail.date_fin).toLocaleDateString('fr-FR')}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-quasi-noir mb-6">Historique des Paiements</h2>
          
          {!paiements || paiements.length === 0 ? (
            <div className="text-center py-12 bg-sable-fond rounded-2xl border border-dashed border-ardoise-gris/30">
              <p className="text-ardoise-gris font-medium">Aucun paiement enregistré pour ce contrat.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paiements.map(paiement => (
                <div key={paiement.id} className="bg-white p-4 rounded-2xl border border-ardoise-gris/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-ardoise-gris/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {paiement.statut === 'paye' ? (
                      <CheckCircle2 className="w-10 h-10 text-emeraude bg-emeraude/10 rounded-full p-2" />
                    ) : paiement.statut === 'en_retard' ? (
                      <AlertCircle className="w-10 h-10 text-red-500 bg-red-50 rounded-full p-2" />
                    ) : (
                      <Clock className="w-10 h-10 text-safran-accent bg-safran-accent/10 rounded-full p-2" />
                    )}
                    <div>
                      <h4 className="font-bold text-quasi-noir">{formatMois(paiement.mois)} {paiement.annee}</h4>
                      <p className="text-sm text-ardoise-gris">
                        {paiement.statut === 'paye' ? `Payé le ${new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}` : 'En attente de paiement'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-t-0 border-ardoise-gris/10 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="font-black text-quasi-noir">{new Intl.NumberFormat('fr-SN').format(paiement.montant)} CFA</p>
                      <p className={`text-xs font-bold ${
                        paiement.statut === 'paye' ? 'text-emeraude' : 
                        paiement.statut === 'en_retard' ? 'text-red-600' : 'text-safran-accent'
                      }`}>
                        {paiement.statut.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {paiement.statut === 'paye' ? (
                        <Link 
                          href={`/baux/${bail.id}/quittance/${paiement.id}`}
                          className="text-xs font-bold bg-indigo-principal/10 text-indigo-principal px-3 py-1.5 rounded-full hover:bg-indigo-principal hover:text-white transition-colors"
                        >
                          Quittance
                        </Link>
                      ) : (
                        <BoutonLienPaiement paiementId={paiement.id} />
                      )}
                      
                      {paiement.statut === 'en_retard' && bail.locataires?.email && (
                        <a 
                          href={`mailto:${bail.locataires.email}?subject=Relance%20-%20Loyer%20de%20${formatMois(paiement.mois)}&body=Bonjour%20${bail.locataires.prenom},%0D%0A%0D%0ASauf%20erreur%20de%20notre%20part,%20le%20loyer%20de%20${formatMois(paiement.mois)}%20${paiement.annee}%20d'un%20montant%20de%20${paiement.montant}%20CFA%20n'a%20pas%20encore%20%C3%A9t%C3%A9%20r%C3%A9gl%C3%A9.%0D%0AMerci%20de%20r%C3%A9gulariser%20la%20situation%20d%C3%A8s%20que%20possible.%0D%0A%0D%0ACordialement.`}
                          className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                        >
                          Email
                        </a>
                      )}
                      
                      {(paiement.statut === 'en_retard' || paiement.statut === 'en_attente') && bail.locataires?.prenom && (
                        <BoutonWhatsApp 
                          locataireNom={bail.locataires.prenom}
                          mois={formatMois(paiement.mois)}
                          annee={paiement.annee}
                          montant={paiement.montant}
                          paiementId={paiement.id}
                          telephone={bail.locataires.telephone}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-quasi-noir mb-6">Ajouter un Paiement</h2>
          <FormPaiement bailId={bail.id} loyerMensuel={bail.loyer_mensuel} />
        </div>
      </div>
    </div>
  )
}
