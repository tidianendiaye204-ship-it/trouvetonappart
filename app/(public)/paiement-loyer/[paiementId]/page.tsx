import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Home, MapPin, CalendarDays, Wallet } from 'lucide-react'
import CheckoutLoyer from '@/components/CheckoutLoyer'

export default async function PaiementLoyerPage({
  params,
}: {
  params: Promise<{ paiementId: string }>
}) {
  const { paiementId } = await params
  
  // Utiliser le client admin car le locataire n'est pas connecté
  const supabase = createAdminClient()

  // 1. Récupérer les détails de l'échéance
  const { data: paiement, error } = await supabase
    .from('paiements')
    .select(`
      *,
      baux (
        loyer_mensuel,
        biens (titre, adresse, ville),
        locataires (prenom, nom)
      )
    `)
    .eq('id', paiementId)
    .single()

  if (error || !paiement) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-sable-fond">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-black text-quasi-noir mb-2">Lien invalide</h1>
          <p className="text-ardoise-gris">Cette échéance de loyer n'existe pas ou le lien est expiré.</p>
        </div>
      </div>
    )
  }

  // 2. Vérifier si déjà payé
  if (paiement.statut === 'paye') {
    redirect(`/paiement-loyer/${paiementId}/confirmation?statut=success`)
  }

  const locataire = paiement.baux?.locataires
  const bien = paiement.baux?.biens

  const formatMois = (mois: number) => {
    const noms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    return noms[mois - 1]
  }

  return (
    <div className="min-h-screen bg-sable-fond py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header (Logo / Titre) */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-principal/10 rounded-2xl mb-6">
            <Home className="w-8 h-8 text-indigo-principal" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-quasi-noir mb-2">
            Paiement de votre loyer
          </h1>
          <p className="text-ardoise-gris font-medium">
            Bonjour {locataire?.prenom}, voici le récapitulatif de votre échéance.
          </p>
        </div>

        {/* Détails Facture */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-ardoise-gris/10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-ardoise-gris/10">
            {/* Loyer */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-principal/5 rounded-xl text-indigo-principal mt-1">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-1">Montant à régler</p>
                <p className="font-display text-3xl font-black text-quasi-noir">
                  {new Intl.NumberFormat('fr-SN').format(paiement.montant)} <span className="text-xl">CFA</span>
                </p>
              </div>
            </div>

            {/* Période */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-safran-accent/10 rounded-xl text-safran-accent mt-1">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-1">Période</p>
                <p className="font-bold text-lg text-quasi-noir">
                  {formatMois(paiement.mois)} {paiement.annee}
                </p>
              </div>
            </div>
          </div>

          {/* Bien concerné */}
          <div className="mb-8 bg-sable-fond rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-ardoise-gris">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-quasi-noir">{bien?.titre}</p>
              <p className="text-sm text-ardoise-gris">{bien?.adresse}, {bien?.ville}</p>
            </div>
          </div>

          {/* Composant de paiement client */}
          <CheckoutLoyer paiementId={paiement.id} montant={paiement.montant} />

        </div>

        <p className="text-center text-xs text-ardoise-gris font-medium">
          Plateforme sécurisée par TrouvetonAppartement
        </p>
      </div>
    </div>
  )
}
