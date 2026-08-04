import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { numberToWords } from '@/lib/numberToWords'
import PrintButton from '@/components/PrintButton'

export default async function QuittancePage({ params }: { params: Promise<{ id: string, paiementId: string }> }) {
  const { id, paiementId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Retrieve user's profile for the landlord info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Retrieve the payment details, lease, tenant and property
  const { data: paiement } = await supabase
    .from('paiements')
    .select(`
      *,
      baux (
        *,
        biens (titre, adresse),
        locataires (prenom, nom, email, telephone)
      )
    `)
    .eq('id', paiementId)
    .eq('bail_id', id)
    .single()

  if (!paiement || paiement.statut !== 'paye') {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Quittance indisponible</h1>
        <p className="text-gray-600 mb-8">Ce paiement n'existe pas ou n'a pas encore été réglé.</p>
        <Link href={`/baux/${id}`} className="text-indigo-principal hover:underline">
          Retour au contrat
        </Link>
      </div>
    )
  }

  const bail = paiement.baux
  const locataire = bail.locataires
  const bien = bail.biens
  const proprietaire = profile

  const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const moisTexte = moisNoms[paiement.mois - 1]
  const montantLettres = numberToWords(paiement.montant)

  // Generate a receipt number
  const numQuittance = `Q-${paiement.annee}${String(paiement.mois).padStart(2, '0')}-${paiement.id.split('-')[0].toUpperCase()}`
  const dateEmission = new Date().toLocaleDateString('fr-FR')
  const datePaiement = new Date(paiement.date_paiement).toLocaleDateString('fr-FR')

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Actions (Not printed) */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link href={`/baux/${id}`} className="text-ardoise-gris hover:text-quasi-noir flex items-center gap-2 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour au contrat
        </Link>
        <PrintButton />
      </div>

      {/* Quittance (Printable area) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
        
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="font-display text-4xl font-black text-quasi-noir mb-2 tracking-tight">Quittance de Loyer</h1>
            <p className="text-gray-500 font-medium">N° {numQuittance}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Date d'émission</p>
            <p className="font-bold text-quasi-noir">{dateEmission}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Le Propriétaire</h3>
            <p className="font-bold text-gray-900 text-lg">{proprietaire?.nom}</p>
            {proprietaire?.telephone && <p className="text-gray-600 mt-1">{proprietaire.telephone}</p>}
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Le Locataire</h3>
            <p className="font-bold text-gray-900 text-lg">{locataire.prenom} {locataire.nom}</p>
            <p className="text-gray-600 mt-1">{locataire.telephone}</p>
            {locataire.email && <p className="text-gray-600">{locataire.email}</p>}
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Détails de la Location</h3>
          <div className="border-l-4 border-indigo-principal pl-4 py-1">
            <p className="font-bold text-quasi-noir">{bien.titre}</p>
            <p className="text-gray-600 mt-1">{bien.adresse.split(',').slice(0, 2).join(',')}</p>
          </div>
        </div>

        <div className="bg-indigo-principal/5 border border-indigo-principal/10 rounded-2xl p-8 mb-12">
          <p className="text-lg leading-relaxed text-quasi-noir text-justify">
            Reçu de <strong>{locataire.prenom} {locataire.nom}</strong> la somme de 
            <span className="font-black text-indigo-principal text-xl mx-2">
              {new Intl.NumberFormat('fr-SN').format(paiement.montant)} CFA
            </span> 
            ({montantLettres} franc CFA) au titre du loyer du mois de <strong>{moisTexte} {paiement.annee}</strong> pour le logement sis à <strong>{bien.adresse.split(',')[0]}</strong>.
          </p>
          
          <div className="mt-6 flex items-center justify-between border-t border-indigo-principal/10 pt-6">
            <p className="text-sm text-gray-500">Paiement reçu le : <strong className="text-gray-900">{datePaiement}</strong></p>
            <p className="text-sm text-gray-500">Période concernée : <strong className="text-gray-900">01 {moisTexte} - {new Date(paiement.annee, paiement.mois, 0).getDate()} {moisTexte} {paiement.annee}</strong></p>
          </div>
        </div>

        <div className="mt-16 pt-8 text-right">
          <p className="text-sm text-gray-500 mb-6">Signature du propriétaire</p>
          <p className="font-display font-black text-2xl text-quasi-noir italic">{proprietaire?.nom}</p>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Ce reçu annule tous les reçus qui auraient pu être donnés pour le même mois.</p>
          <p className="mt-1">Cette quittance est délivrée sous réserve d'encaissement (en cas de paiement par chèque).</p>
        </div>
      </div>
      
    </div>
  )
}
