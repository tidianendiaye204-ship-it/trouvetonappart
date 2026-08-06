import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FormulaireContact from '@/components/FormulaireContact'
import BoutonSignaler from '@/components/BoutonSignaler'
import BoutonPartagerNatif from '@/components/BoutonPartagerNatif'
import { MapPin, BedDouble, Maximize2, Home, ArrowLeft } from 'lucide-react'

function raccourcirAdresse(adresseComplete: string): string {
  if (!adresseComplete) return ''
  return adresseComplete.split(',').slice(0, 2).join(',').trim()
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: bien } = await supabase
    .from('biens')
    .select('id, titre, description, prix, type, transaction, ville, quartier, latitude, longitude, created_at, statut, biens_images(url, ordre)')
    .eq('id', id)
    .single()

  if (!bien) {
    return { title: 'Annonce introuvable | TrouveTonAppart' }
  }

  const images = (bien.biens_images ?? []).sort((a: any, b: any) => a.ordre - b.ordre)
  const imageUrl = images.length > 0 ? images[0].url : ''
  const prixStr = `${bien.prix.toLocaleString('fr-FR')} FCFA${bien.transaction === 'location' ? '/mois' : ''}`
  
  const description = bien.description 
    ? (bien.description.length > 150 ? bien.description.substring(0, 147) + '...' : bien.description)
    : `${bien.type} à ${bien.transaction} - ${prixStr}`

  return {
    title: `${bien.titre} | TrouveTonAppart`,
    description: description,
    alternates: {
      canonical: `/annonce/${bien.id}`,
    },
    keywords: [`${bien.type}`, `${bien.transaction}`, 'Sénégal', 'Immobilier', 'TrouveTonAppart', bien.ville || ''],
    openGraph: {
      title: `${bien.titre} - ${prixStr}`,
      description: description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'article',
      url: `/annonce/${bien.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bien.titre} - ${prixStr}`,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function AnnoncePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: bien } = await supabase
    .from('biens')
    .select('*, biens_images(url, ordre), profiles(nom)')
    .eq('id', id)
    .single()

  if (!bien) notFound()

  const images = (bien.biens_images ?? []).sort(
    (a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre
  )
  const isDisponible = bien.statut === 'disponible'

  // Schema.org RealEstateListing
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": bien.titre,
    "description": bien.description || `${bien.type} à ${bien.transaction}`,
    "image": images.map((i: any) => i.url),
    "datePosted": bien.created_at,
    "offers": {
      "@type": "Offer",
      "price": bien.prix,
      "priceCurrency": "XOF",
      "availability": isDisponible ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      "url": `https://trouvetonappartement.sn/annonce/${bien.id}`
    },
    "place": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": bien.ville,
        "addressRegion": bien.quartier,
        "addressCountry": "SN"
      },
      "geo": (bien.latitude && bien.longitude) ? {
        "@type": "GeoCoordinates",
        "latitude": bien.latitude,
        "longitude": bien.longitude
      } : undefined
    }
  }

  return (
    <div className="min-h-screen bg-sable-fond pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* En-tête de retour */}
        <div className="mb-6">
          <Link href="/recherche" className="inline-flex items-center text-sm font-bold text-ardoise-gris hover:text-indigo-principal transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la recherche
          </Link>
        </div>

        {/* Galerie photos (Masonry) */}
        <div className="mb-10 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-2 h-75 sm:h-100 md:h-125">
          {images.length > 0 ? (
            <>
              {/* Grande image principale */}
              <div className="relative h-full w-full col-span-1">
                <Image src={images[0].url} alt={bien.titre} fill className="object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              {/* Images secondaires */}
              <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                {images[1] ? (
                  <div className="relative h-full w-full">
                    <Image src={images[1].url} alt={`${bien.titre} - 2`} fill className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ) : (
                  <div className="bg-white/50 h-full w-full"></div>
                )}
                {images[2] ? (
                  <div className="relative h-full w-full">
                    <Image src={images[2].url} alt={`${bien.titre} - 3`} fill className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ) : (
                  <div className="bg-white/50 h-full w-full"></div>
                )}
              </div>
            </>
          ) : (
            <div className="col-span-1 md:col-span-2 h-full flex flex-col items-center justify-center bg-linear-to-br from-sable-fond to-ardoise-gris/10 text-ardoise-gris/50">
              <Home className="w-16 h-16 mb-4 opacity-50" />
              <span className="font-medium text-lg">Pas de photo disponible</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Colonne principale (Détails) */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-indigo-principal/10 text-indigo-principal px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  À {bien.transaction === 'location' ? 'Louer' : 'Vendre'}
                </span>
                <span className="bg-white border border-ardoise-gris/20 text-quasi-noir px-3 py-1 rounded-full text-xs font-bold shadow-sm capitalize">
                  {bien.type}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-quasi-noir mb-4 leading-tight">{bien.titre}</h1>
              <p className="text-ardoise-gris text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-principal" />
                {raccourcirAdresse(bien.adresse)}
              </p>
            </div>

            {/* Badges de caractéristiques */}
            <div className="flex flex-wrap gap-4 py-6 border-y border-ardoise-gris/10">
              {bien.nb_chambres && (
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-ardoise-gris/10 shadow-sm">
                  <BedDouble className="w-6 h-6 text-indigo-principal" />
                  <div>
                    <p className="text-xs text-ardoise-gris font-bold uppercase tracking-wide">Chambres</p>
                    <p className="font-bold text-quasi-noir text-lg">{bien.nb_chambres}</p>
                  </div>
                </div>
              )}
              {bien.superficie && (
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-ardoise-gris/10 shadow-sm">
                  <Maximize2 className="w-6 h-6 text-indigo-principal" />
                  <div>
                    <p className="text-xs text-ardoise-gris font-bold uppercase tracking-wide">Surface</p>
                    <p className="font-bold text-quasi-noir text-lg">{bien.superficie} m²</p>
                  </div>
                </div>
              )}
            </div>

            {bien.description && (
              <div>
                <h2 className="font-display font-bold mb-4 text-quasi-noir text-2xl">À propos de ce bien</h2>
                <div className="text-ardoise-gris whitespace-pre-line leading-relaxed text-lg bg-white p-6 sm:p-8 rounded-3xl border border-ardoise-gris/10 shadow-sm">
                  {bien.description}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale (Prix & Contact - Sticky) */}
          <div className="relative">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-ardoise-gris/10 p-6 sm:p-8">
                
                {/* Encart Prix */}
                <div className="mb-8">
                  <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-2">Prix {bien.transaction === 'location' ? 'mensuel' : 'demandé'}</p>
                  <p className="font-display font-black text-indigo-principal text-3xl sm:text-4xl">
                    {bien.prix.toLocaleString('fr-FR')} <span className="text-xl">FCFA</span>
                  </p>
                </div>

                {/* Boutons Contact Direct */}
                {(bien.telephone || bien.whatsapp) && (
                  <div className="mb-8 space-y-3">
                    <p className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-3">Contacter le propriétaire</p>
                    {bien.telephone && (
                      <a
                        href={`tel:${bien.telephone}`}
                        className="flex items-center justify-center gap-3 w-full bg-indigo-principal/10 hover:bg-indigo-principal text-indigo-principal hover:text-white rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 group"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Appeler · {bien.telephone}
                      </a>
                    )}
                    {bien.whatsapp && (
                      <a
                        href={`https://wa.me/${bien.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce "${bien.titre}" sur TrouveTonAppart.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 group"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
                
                {/* Bouton Partager (Toujours visible) */}
                <div className="mb-8">
                  <BoutonPartagerNatif titre={bien.titre} />
                </div>

                <hr className="border-ardoise-gris/10 mb-8" />

                {/* Formulaire de Contact */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-ardoise-gris/10">
                  <h2 className="text-xl font-bold text-quasi-noir mb-6">Contacter le propriétaire</h2>
                  <FormulaireContact 
                    bienId={bien.id} 
                  />
                  
                  <BoutonSignaler bienId={bien.id} />
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
