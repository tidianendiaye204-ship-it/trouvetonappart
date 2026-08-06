import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CarteAnnonce from '@/components/CarteAnnonce'
import { MapPin, Search } from 'lucide-react'
import Link from 'next/link'

// Fonction pour capitaliser la ville proprement
const formatVille = (villeStr: string) => {
  return villeStr.charAt(0).toUpperCase() + villeStr.slice(1).toLowerCase()
}

type Props = {
  params: { ville: string }
}

// 1. Génération dynamique des métadonnées (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const villeFormatee = formatVille(params.ville)
  
  return {
    title: `Immobilier à ${villeFormatee} : Location et Vente | TrouveTonAppart`,
    description: `Découvrez toutes nos annonces immobilières à ${villeFormatee}. Appartements, maisons, terrains à louer ou à vendre. Les meilleures offres sans frais d'agence cachés.`,
    openGraph: {
      title: `Immobilier à ${villeFormatee}`,
      description: `Trouvez votre prochain logement à ${villeFormatee} parmi nos dizaines d'annonces vérifiées.`,
      url: `/immobilier/${params.ville}`,
    }
  }
}

export default async function VilleImmobilierPage({ params }: Props) {
  const villeOriginale = params.ville
  const villeFormatee = formatVille(villeOriginale)
  
  const supabase = await createClient()

  // 2. Fetch des biens pour cette ville
  // On utilise ilike pour être insensible à la casse
  const { data: biens, error } = await supabase
    .from('biens')
    .select('*')
    .eq('statut', 'disponible')
    .ilike('ville', `%${villeOriginale}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erreur chargement biens ville:", error)
  }

  const annonces = biens || []

  // 3. Schema.org JSON-LD (Rich Snippets)
  const schemaLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Biens immobiliers à ${villeFormatee}`,
    "description": `Liste des annonces de location et vente à ${villeFormatee}`,
    "itemListElement": annonces.map((bien, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "RealEstateListing",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/annonce/${bien.id}`,
        "name": bien.titre,
        "image": bien.image_principale || undefined,
        "offers": {
          "@type": "Offer",
          "price": bien.prix,
          "priceCurrency": "XOF",
          "businessFunction": bien.transaction === 'location' ? 'LeaseOut' : 'Sell'
        }
      }
    }))
  }

  return (
    <div className="min-h-screen bg-sable-fond pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Balisage SEO Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLd) }}
      />

      <div className="max-w-7xl mx-auto">
        
        {/* Header SEO */}
        <div className="bg-indigo-principal text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <MapPin className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-display font-black mb-4 leading-tight">
              Immobilier à {villeFormatee}
            </h1>
            <p className="text-lg text-indigo-50 font-medium">
              Découvrez notre sélection de {annonces.length} annonces de maisons et appartements à louer ou à vendre.
            </p>
          </div>
        </div>

        {/* Liste des biens */}
        {annonces.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center border border-ardoise-gris/10">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-ardoise-gris" />
            </div>
            <h2 className="text-xl font-bold text-quasi-noir mb-2">Aucune annonce trouvée pour {villeFormatee}</h2>
            <p className="text-ardoise-gris mb-6">Nous n&apos;avons pas encore de biens disponibles dans cette ville.</p>
            <Link href="/recherche" className="bg-indigo-principal text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-indigo-600 transition-colors">
              Voir toutes les villes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {annonces.map(bien => (
              <CarteAnnonce key={bien.id} bien={bien} />
            ))}
          </div>
        )}

        {/* Texte SEO Bas de page (Très important pour Google) */}
        {annonces.length > 0 && (
          <div className="bg-white rounded-3xl p-8 border border-ardoise-gris/10 shadow-sm mt-10">
            <h2 className="text-xl font-bold text-quasi-noir mb-4">
              Le marché immobilier à {villeFormatee}
            </h2>
            <p className="text-ardoise-gris text-sm leading-relaxed mb-4">
              Que vous cherchiez un appartement moderne, une villa spacieuse ou un studio abordable, {villeFormatee} offre un marché immobilier dynamique. 
              Sur TrouveTonAppartement, nous connectons directement les propriétaires et les locataires/acheteurs, sans frais d&apos;agence. 
              Parcourez nos annonces mises à jour quotidiennement pour trouver le logement idéal correspondant à vos critères de prix et de localisation à {villeFormatee}.
            </p>
            <p className="text-ardoise-gris text-sm leading-relaxed font-bold">
              Astuce : N&apos;hésitez pas à utiliser notre système d&apos;alerte email pour être prévenu en avant-première des nouvelles annonces à {villeFormatee}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
