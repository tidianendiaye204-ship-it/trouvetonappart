import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { CheckCircle2, XCircle, Clock, ArrowRight, Download } from 'lucide-react'

export default async function PaiementConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ paiementId: string }>
  searchParams: Promise<{ statut?: string; raison?: string }>
}) {
  const { paiementId } = await params
  const resolvedSearchParams = await searchParams
  
  const statut = resolvedSearchParams.statut || 'failed'
  const raison = resolvedSearchParams.raison

  const supabase = createAdminClient()

  // On récupère le bail_id pour le lien de la quittance (si implémenté via /baux/[id]/quittance/[paiementId])
  const { data: paiement } = await supabase
    .from('paiements')
    .select('bail_id')
    .eq('id', paiementId)
    .single()

  if (!paiement) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sable-fond">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-ardoise-gris/10 text-center relative overflow-hidden">
        
        {/* Decorative BG */}
        <div className={`
          absolute top-0 left-0 w-full h-2
          ${statut === 'success' || statut === 'paid' ? 'bg-emeraude' : ''}
          ${statut === 'failed' || statut === 'expired' ? 'bg-red-500' : ''}
          ${statut === 'pending' ? 'bg-safran-accent' : ''}
        `} />

        {/* ICON */}
        <div className="mb-6 flex justify-center">
          {(statut === 'success' || statut === 'paid') && (
            <div className="w-20 h-20 bg-emeraude/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emeraude" />
            </div>
          )}
          {(statut === 'failed' || statut === 'expired') && (
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
          {statut === 'pending' && (
            <div className="w-20 h-20 bg-safran-accent/10 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-safran-accent animate-pulse" />
            </div>
          )}
        </div>

        {/* CONTENT */}
        {(statut === 'success' || statut === 'paid') && (
          <>
            <h1 className="font-display text-3xl font-black text-quasi-noir mb-3">Paiement Validé !</h1>
            <p className="text-ardoise-gris mb-8">
              Votre loyer a bien été réglé. Une notification a été envoyée à votre propriétaire.
            </p>
            <div className="flex flex-col gap-3">
              {/* Le lien vers la quittance suppose que la route est publique ou accessible au locataire. Sinon, il devra l'obtenir du propriétaire */}
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-principal text-white py-3.5 font-bold shadow-md hover:brightness-110 transition-all"
              >
                Imprimer le reçu <Download className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {(statut === 'failed' || statut === 'expired') && (
          <>
            <h1 className="font-display text-3xl font-black text-quasi-noir mb-3">Échec du paiement</h1>
            <p className="text-ardoise-gris mb-8">
              Nous n'avons pas pu valider votre paiement. Aucun montant n'a été débité de votre compte.
              {raison && <span className="block mt-2 text-xs opacity-70">Code d'erreur : {raison}</span>}
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href={`/paiement-loyer/${paiementId}`}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-quasi-noir text-white py-3.5 font-bold shadow-md hover:scale-105 transition-all"
              >
                Réessayer le paiement
              </Link>
            </div>
          </>
        )}

        {statut === 'pending' && (
          <>
            <h1 className="font-display text-3xl font-black text-quasi-noir mb-3">Paiement en attente</h1>
            <p className="text-ardoise-gris mb-8">
              Votre paiement est en cours de traitement par notre partenaire. Votre propriétaire sera averti dès la confirmation.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href={`/paiement-loyer/${paiementId}`}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-principal text-white py-3.5 font-bold shadow-md hover:brightness-110 transition-all"
              >
                Retour
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
