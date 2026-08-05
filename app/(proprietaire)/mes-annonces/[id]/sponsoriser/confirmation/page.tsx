import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'
import { StatutTransactionSponsoring } from '@/types'

export default async function PageConfirmationSponsorisation({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ statut?: string; raison?: string; planJours?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  
  const statut = (resolvedSearchParams.statut as StatutTransactionSponsoring | 'success') || 'failed'
  const raison = resolvedSearchParams.raison
  const planJours = resolvedSearchParams.planJours

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Vérifier que le bien existe et appartient à l'user (pour le bouton retour)
  const { data: bien } = await supabase
    .from('biens')
    .select('titre')
    .eq('id', id)
    .eq('proprietaire_id', user.id)
    .single()

  if (!bien) {
    redirect('/mes-annonces')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
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
            <h1 className="font-display text-3xl font-black text-quasi-noir mb-3">Paiement Réussi !</h1>
            <p className="text-ardoise-gris mb-8">
              Votre bien <strong className="text-quasi-noir">"{bien.titre}"</strong> est maintenant sponsorisé pour les {planJours ? `${planJours} prochains jours` : 'prochains jours'}. Il bénéficiera d'une visibilité maximale.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/mes-annonces"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-principal text-white py-3.5 font-bold shadow-md hover:brightness-110 transition-all"
              >
                Retour au tableau de bord
              </Link>
              <Link 
                href={`/annonce/${id}`}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-sable-fond text-quasi-noir py-3.5 font-bold hover:bg-ardoise-gris/10 transition-all"
              >
                Voir mon annonce <ArrowRight className="w-4 h-4" />
              </Link>
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
                href={`/mes-annonces/${id}/sponsoriser`}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-quasi-noir text-white py-3.5 font-bold shadow-md hover:scale-105 transition-all"
              >
                Réessayer le paiement
              </Link>
              <Link 
                href="/mes-annonces"
                className="text-sm font-bold text-ardoise-gris hover:text-quasi-noir py-2"
              >
                Annuler
              </Link>
            </div>
          </>
        )}

        {statut === 'pending' && (
          <>
            <h1 className="font-display text-3xl font-black text-quasi-noir mb-3">Paiement en attente</h1>
            <p className="text-ardoise-gris mb-8">
              Votre paiement est en cours de traitement par notre partenaire. Votre annonce sera mise en avant automatiquement dès confirmation.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/mes-annonces"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-principal text-white py-3.5 font-bold shadow-md hover:brightness-110 transition-all"
              >
                Retourner à mes annonces
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
