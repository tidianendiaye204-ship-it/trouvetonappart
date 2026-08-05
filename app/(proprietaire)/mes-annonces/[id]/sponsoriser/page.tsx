import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBienById } from '@/lib/services/bien.service'
import { ArrowLeft, Star, ShieldCheck, Zap } from 'lucide-react'
import CheckoutSponsoring from '@/components/CheckoutSponsoring'

export default async function PageSponsoriser({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Récupérer le bien et vérifier l'appartenance
  const bien = await getBienById(id)

  if (!bien || bien.proprietaire_id !== user.id) {
    redirect('/mes-annonces')
  }

  // Vérifier si déjà sponsorisé (optionnel: bloquer ou permettre extension)
  const estDejaSponsorise = bien.sponsorise_jusqu_a
    ? new Date(bien.sponsorise_jusqu_a) > new Date()
    : false

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pt-28">
      {/* Header */}
      <div className="mb-10 text-center">
        <Link 
          href="/mes-annonces" 
          className="inline-flex items-center text-sm font-bold text-ardoise-gris hover:text-indigo-principal transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes annonces
        </Link>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-safran-accent/10 rounded-2xl mb-4">
          <Star className="w-8 h-8 text-safran-accent" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-quasi-noir tracking-tight">
          Mettez votre bien en avant
        </h1>
        <p className="text-ardoise-gris mt-4 text-lg font-medium max-w-2xl mx-auto">
          Propulsez "{bien.titre}" en tête des résultats de recherche. 
          Les annonces sponsorisées reçoivent en moyenne <strong className="text-quasi-noir">4x plus de contacts</strong>.
        </p>

        {estDejaSponsorise && (
          <div className="mt-6 inline-flex items-center gap-2 bg-indigo-principal/10 text-indigo-principal px-4 py-2 rounded-xl text-sm font-bold border border-indigo-principal/20">
            <ShieldCheck className="w-4 h-4" />
            Ce bien est déjà sponsorisé jusqu'au {new Date(bien.sponsorise_jusqu_a!).toLocaleDateString('fr-FR')}. 
            Prendre un nouveau plan prolongera cette date.
          </div>
        )}
      </div>

      {/* Avantages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-ardoise-gris/10 shadow-sm text-center">
          <div className="w-12 h-12 bg-indigo-principal/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-indigo-principal" />
          </div>
          <h3 className="font-bold text-quasi-noir mb-2">Visibilité Max</h3>
          <p className="text-sm text-ardoise-gris">Votre annonce apparaît en premier dans toutes les recherches correspondantes.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-ardoise-gris/10 shadow-sm text-center">
          <div className="w-12 h-12 bg-safran-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-safran-accent" />
          </div>
          <h3 className="font-bold text-quasi-noir mb-2">Badge Spécial</h3>
          <p className="text-sm text-ardoise-gris">Un badge distinctif attire l'œil des locataires potentiels sur la carte.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-ardoise-gris/10 shadow-sm text-center">
          <div className="w-12 h-12 bg-emeraude/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-emeraude" />
          </div>
          <h3 className="font-bold text-quasi-noir mb-2">Résultat Garanti</h3>
          <p className="text-sm text-ardoise-gris">Trouvez votre locataire beaucoup plus rapidement et gagnez des mois de loyer.</p>
        </div>
      </div>

      {/* Composant Interactif (Client) */}
      <CheckoutSponsoring bienId={bien.id} />
      
    </div>
  )
}
