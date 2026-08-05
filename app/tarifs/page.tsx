import { CheckCircle2, HelpCircle, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const TIERS = [
  {
    name: 'Découverte',
    id: 'gratuit',
    href: '/login',
    price: '0',
    description: 'Parfait pour un propriétaire testant la plateforme.',
    features: ['Jusqu\'à 2 biens immobiliers', 'Réception de contacts (CRM basique)', 'Support communautaire'],
    mostPopular: false,
  },
  {
    name: 'Indépendant',
    id: 'solo',
    href: '/login',
    price: '15 000',
    description: 'Pour les propriétaires gérant quelques biens.',
    features: ['Jusqu\'à 10 biens immobiliers', 'CRM complet (Relances, WhatsApp)', 'Dossier locataire numérique', 'Support par email'],
    mostPopular: false,
  },
  {
    name: 'Agence Pro',
    id: 'pro',
    href: '/login',
    price: '35 000',
    description: 'La solution complète pour les agences immobilières.',
    features: ['Jusqu\'à 50 biens immobiliers', 'Encaissement des loyers en ligne', 'Automatisation (Email & SMS)', '1 bien sponsorisé par mois', 'Support prioritaire'],
    mostPopular: true,
  },
  {
    name: 'Réseau',
    id: 'business',
    href: 'mailto:contact@trouvetonappartement.sn',
    price: '90 000',
    description: 'Pour les grandes agences et promoteurs.',
    features: ['Biens illimités', 'Fonctionnalité Marque Blanche', 'Comptes collaborateurs', 'Accompagnement dédié (Account Manager)'],
    mostPopular: false,
  },
]

const FAQS = [
  {
    question: "Puis-je changer d'abonnement en cours de route ?",
    answer: "Absolument. Vous pouvez passer à un plan supérieur à tout moment depuis votre tableau de bord. La différence sera calculée au prorata."
  },
  {
    question: "Comment fonctionnent les encaissements de loyer (Plan Pro) ?",
    answer: "Nous sommes intégrés avec les principaux opérateurs locaux (Wave, Orange Money). Vous recevez l'argent directement, et la quittance est générée automatiquement."
  },
  {
    question: "Y a-t-il des frais cachés sur les transactions ?",
    answer: "Non. L'abonnement mensuel couvre l'accès au logiciel. Pour les transactions financières (encaissement de loyer), les frais standard des opérateurs (ex: 1% pour Wave) s'appliquent sans surcoût de notre part."
  },
  {
    question: "Que se passe-t-il si je dépasse la limite de biens ?",
    answer: "Votre compte ne sera pas bloqué, mais vous ne pourrez pas publier de nouvelle annonce avant de passer au plan supérieur."
  }
]

export default function PricingPage() {
  return (
    <div className="bg-sable-fond min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* EN TÊTE */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-principal uppercase tracking-wider">Tarifs & Abonnements</h2>
          <p className="mt-2 text-4xl font-black tracking-tight text-quasi-noir sm:text-5xl">
            Des outils de pro, un prix adapté au Sénégal.
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-ardoise-gris">
          Que vous soyez un propriétaire individuel ou une agence avec des centaines de lots, nous avons le forfait qu'il vous faut pour digitaliser votre gestion.
        </p>

        {/* GRILLE TARIFAIRE */}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-4">
          {TIERS.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 xl:p-10 transition-all hover:scale-105 duration-300 ${
                tier.mostPopular ? 'bg-quasi-noir text-white ring-2 ring-indigo-principal shadow-2xl scale-105 z-10' : 'bg-white text-quasi-noir ring-1 ring-ardoise-gris/10 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className={`text-lg font-bold leading-8 ${tier.mostPopular ? 'text-white' : 'text-quasi-noir'}`}>
                  {tier.name}
                </h3>
                {tier.mostPopular && (
                  <p className="rounded-full bg-indigo-principal/20 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-200">
                    Recommandé
                  </p>
                )}
              </div>
              <p className={`mt-4 text-sm leading-6 ${tier.mostPopular ? 'text-gray-300' : 'text-ardoise-gris'}`}>
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-black tracking-tight">{tier.price}</span>
                <span className={`text-sm font-semibold leading-6 ${tier.mostPopular ? 'text-gray-400' : 'text-ardoise-gris'}`}>
                  FCFA/mois
                </span>
              </p>
              <a
                href={tier.href}
                className={`mt-6 block rounded-xl px-3 py-3 text-center text-sm font-bold leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors ${
                  tier.mostPopular
                    ? 'bg-indigo-principal text-white hover:bg-indigo-500 focus-visible:outline-indigo-500'
                    : 'bg-indigo-50 text-indigo-principal hover:bg-indigo-100 ring-1 ring-inset ring-indigo-200'
                }`}
              >
                {tier.id === 'business' ? 'Nous contacter' : 'Commencer gratuitement'}
              </a>
              <ul className={`mt-8 space-y-3 text-sm leading-6 ${tier.mostPopular ? 'text-gray-300' : 'text-ardoise-gris'}`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckCircle2 className={`h-6 w-5 flex-none ${tier.mostPopular ? 'text-indigo-400' : 'text-indigo-principal'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SECTION FAQ */}
        <div className="mx-auto mt-32 max-w-4xl divide-y divide-ardoise-gris/10">
          <h2 className="text-2xl font-black leading-10 tracking-tight text-quasi-noir flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-principal" /> Foire aux questions
          </h2>
          <dl className="mt-10 space-y-8 divide-y divide-ardoise-gris/10">
            {FAQS.map((faq) => (
              <div key={faq.question} className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                <dt className="text-base font-bold leading-7 text-quasi-noir lg:col-span-5">{faq.question}</dt>
                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                  <p className="text-base leading-7 text-ardoise-gris">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* CTA FINAL */}
        <div className="mx-auto mt-32 max-w-4xl bg-indigo-900 rounded-3xl p-8 sm:p-16 text-center shadow-xl border border-indigo-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-indigo-500/20 to-transparent"></div>
          <h2 className="text-3xl font-black tracking-tight text-white relative z-10">
            Prêt à transformer votre gestion immobilière ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-indigo-100 relative z-10">
            Rejoignez les agences qui gagnent du temps chaque mois. Créez votre compte gratuit aujourd'hui, sans carte de crédit.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6 relative z-10">
            <Link
              href="/login"
              className="rounded-xl bg-white px-8 py-4 text-sm font-bold text-indigo-900 shadow-sm hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all flex items-center gap-2"
            >
              Créer mon compte <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:contact@trouvetonappartement.sn" className="text-sm font-semibold leading-6 text-white flex items-center gap-2 hover:text-indigo-200">
              <Phone className="w-4 h-4" /> Demander une démo
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
