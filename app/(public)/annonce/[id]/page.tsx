import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FormulaireContact from '@/components/FormulaireContact'
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
    .select('titre, description, prix, type, transaction, biens_images(url, ordre)')
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
    openGraph: {
      title: `${bien.titre} - ${prixStr}`,
      description: description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
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
    .select('*, biens_images(url, ordre)')
    .eq('id', id)
    .eq('publie', true)
    .single()

  if (!bien) notFound()

  const images = (bien.biens_images ?? []).sort(
    (a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre
  )

  return (
    <div className="bg-sable-fond min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
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

                <hr className="border-ardoise-gris/10 mb-8" />

                {/* Formulaire Contact */}
                <FormulaireContact bienId={bien.id} />
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
