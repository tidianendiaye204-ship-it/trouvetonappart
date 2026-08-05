import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CarteAnnonce from '@/components/CarteAnnonce'
import { MapPin, ChevronRight, Home, Building2, Trees } from 'lucide-react'

// On formatte la ville pour l'affichage (ex: dakar -> Dakar, saint-louis -> Saint-Louis)
function formatVille(villeSlug: string) {
  return villeSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export async function generateMetadata({ params }: { params: Promise<{ ville: string }> }): Promise<Metadata> {
  const { ville } = await params
  const villeFormatee = formatVille(ville)
  
  return {
    title: `Immobilier à ${villeFormatee} : Achat, Vente et Location | TrouveTonAppart`,
    description: `Découvrez toutes nos annonces immobilières à ${villeFormatee}. Maisons, appartements et terrains à vendre ou à louer au meilleur prix.`,
    alternates: {
      canonical: `/immobilier/${ville.toLowerCase()}`,
    },
    openGraph: {
      title: `Immobilier à ${villeFormatee} - Annonces exclusives`,
      description: `Parcourez les meilleures offres immobilières à ${villeFormatee} sur TrouveTonAppartement.sn`,
      url: `/immobilier/${ville.toLowerCase()}`,
      type: 'website',
    }
  }
}

export default async function VilleSEOPage({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params
  const villeSlug = ville.toLowerCase()
  const villeFormatee = formatVille(ville)
  const supabase = await createClient()

  // On récupère les 12 dernières annonces pour cette ville
  // On utilise ilike pour une recherche insensible à la casse
  const { data: biens } = await supabase
    .from('biens')
    .select('*, biens_images(url, ordre)')
    .eq('publie', true)
    .eq('statut_moderation', 'valide')
    .ilike('ville', `%${villeFormatee}%`)
    .order('created_at', { ascending: false })
    .limit(12)

  // Statistiques rapides
  const nbLocations = biens?.filter(b => b.transaction === 'location').length || 0
  const nbVentes = biens?.filter(b => b.transaction === 'vente').length || 0

  // Schema.org Breadcrumb
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://trouvetonappartement.sn"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Immobilier Sénégal",
        "item": "https://trouvetonappartement.sn/recherche"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Immobilier ${villeFormatee}`,
        "item": `https://trouvetonappartement.sn/immobilier/${villeSlug}`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-sable-fond pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Fil d'ariane visuel */}
        <nav className="flex text-xs font-medium text-ardoise-gris mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-indigo-principal transition-colors">Accueil</Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 mx-1" />
                <Link href="/recherche" className="hover:text-indigo-principal transition-colors">Recherche</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center text-quasi-noir">
                <ChevronRight className="w-3 h-3 mx-1 text-ardoise-gris" />
                <span className="font-bold">{villeFormatee}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* En-tête SEO optimisé (H1) */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-ardoise-gris/10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-principal/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-quasi-noir mb-4 leading-tight">
              Immobilier à <span className="text-indigo-principal">{villeFormatee}</span>
            </h1>
            <p className="text-lg text-ardoise-gris leading-relaxed mb-8">
              Vous cherchez à louer ou acheter à {villeFormatee} ? Parcourez nos offres exclusives de maisons, appartements et terrains. Trouvez le bien qui correspond parfaitement à vos critères dans les meilleurs quartiers de la ville.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={`/recherche?ville=${villeFormatee}&transaction=location`} className="bg-sable-fond hover:bg-indigo-principal/10 text-indigo-principal px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 text-sm">
                Voir les locations ({nbLocations})
              </Link>
              <Link href={`/recherche?ville=${villeFormatee}&transaction=vente`} className="bg-sable-fond hover:bg-safran-accent/20 text-safran-accent-dark px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 text-sm">
                Voir les ventes ({nbVentes})
              </Link>
            </div>
          </div>
        </div>

        {/* Liens rapides par type de bien (Maillage interne) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link href={`/recherche?ville=${villeFormatee}&type=appartement`} className="bg-white p-6 rounded-2xl shadow-sm border border-ardoise-gris/10 hover:border-indigo-principal/30 hover:shadow-md transition-all group flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-principal/10 rounded-xl flex items-center justify-center text-indigo-principal group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-quasi-noir">Appartements à {villeFormatee}</h2>
              <p className="text-xs text-ardoise-gris mt-1">Studios, T2, T3 et plus</p>
            </div>
          </Link>
          
          <Link href={`/recherche?ville=${villeFormatee}&type=maison`} className="bg-white p-6 rounded-2xl shadow-sm border border-ardoise-gris/10 hover:border-safran-accent/50 hover:shadow-md transition-all group flex items-center gap-4">
            <div className="w-12 h-12 bg-safran-accent/10 rounded-xl flex items-center justify-center text-safran-accent group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-quasi-noir">Maisons & Villas</h2>
              <p className="text-xs text-ardoise-gris mt-1">Avec jardin, piscine...</p>
            </div>
          </Link>

          <Link href={`/recherche?ville=${villeFormatee}&type=terrain`} className="bg-white p-6 rounded-2xl shadow-sm border border-ardoise-gris/10 hover:border-emeraude/30 hover:shadow-md transition-all group flex items-center gap-4">
            <div className="w-12 h-12 bg-emeraude/10 rounded-xl flex items-center justify-center text-emeraude group-hover:scale-110 transition-transform">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-quasi-noir">Terrains à {villeFormatee}</h2>
              <p className="text-xs text-ardoise-gris mt-1">Construisez votre projet</p>
            </div>
          </Link>
        </div>

        {/* Liste des annonces */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-quasi-noir">
            Dernières annonces à {villeFormatee}
          </h2>
        </div>

        {biens && biens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {biens.map((bien) => (
              <CarteAnnonce key={bien.id} bien={bien} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-ardoise-gris/10">
            <MapPin className="w-12 h-12 text-ardoise-gris/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-quasi-noir mb-2">Aucune annonce pour le moment</h3>
            <p className="text-ardoise-gris mb-6">Soyez le premier à publier une annonce à {villeFormatee}.</p>
            <Link href="/baux/nouveau" className="inline-block bg-indigo-principal text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Publier une annonce
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
