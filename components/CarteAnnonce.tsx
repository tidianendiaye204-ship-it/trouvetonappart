import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Home } from 'lucide-react'

import { Bien } from '@/types'
import BoutonFavori from './BoutonFavori'
import BadgeConfiance from './BadgeConfiance'
import StatutBienBadge from './StatutBienBadge'
import { calculerScoreConfiance } from '@/lib/utils/trustScore'

export default function CarteAnnonce({ bien }: { bien: Bien }) {
    const estSponsorise = bien.sponsorise_jusqu_a ? new Date(bien.sponsorise_jusqu_a) > new Date() : false;

    return (
        <Link
            href={`/annonce/${bien.id}`}
            className={`block rounded-3xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${estSponsorise ? 'border-safran-accent/50 shadow-safran-accent/10' : 'border-ardoise-gris/10 bg-white'}`}
        >
            <div className="relative aspect-4/3 w-full bg-sable-fond overflow-hidden">
                {bien.image_principale ? (
                    <Image
                        src={bien.image_principale}
                        alt={bien.titre}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-sable-fond to-ardoise-gris/10 flex flex-col items-center justify-center text-ardoise-gris/40">
                        <Home className="w-10 h-10 mb-2" />
                        <span className="text-sm font-medium">Pas de photo</span>
                    </div>
                )}
                
                {/* Overlay gradient pour le texte si besoin, ici on met les badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {estSponsorise && (
                        <span className="bg-safran-accent text-quasi-noir px-3 py-1 rounded-full text-xs font-black tracking-wider shadow-md w-fit flex items-center gap-1">
                            <span className="text-lg leading-none">🌟</span> Sponsorisé
                        </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-md text-quasi-noir px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm w-fit">
                        {bien.transaction === 'location' ? 'À Louer' : 'À Vendre'}
                    </span>
                </div>
                <div className="absolute bottom-3 right-3 flex gap-2 z-10 flex-col items-end">
                    <StatutBienBadge statut={bien.statut} />
                    <span className="bg-quasi-noir/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm capitalize">
                        {bien.type}
                    </span>
                </div>
                {/* Bouton favori */}
                <div className="absolute top-3 right-3 z-20">
                    <BoutonFavori bienId={bien.id} />
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-display font-bold text-quasi-noir text-lg line-clamp-1 flex-1" title={bien.titre}>{bien.titre}</p>
                </div>
                
                {/* Trust System */}
                {(bien as any).profiles?.is_verified && (
                    <div className="mb-2">
                        <BadgeConfiance type={(bien as any).profiles?.type_compte === 'agence' ? 'agence' : 'owner'} />
                    </div>
                )}
                
                <p className="text-sm text-ardoise-gris mb-4 flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="w-4 h-4 shrink-0 text-indigo-principal/70" />
                    {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville ?? ''}
                </p>
                
                <div className="flex items-end justify-between border-t border-ardoise-gris/10 pt-4 mt-auto">
                    <div>
                        <p className="text-[10px] text-ardoise-gris uppercase font-bold tracking-wider mb-0.5">Prix {bien.transaction === 'location' ? 'mensuel' : 'demandé'}</p>
                        <p className="font-display font-black text-indigo-principal text-xl">
                            {bien.prix.toLocaleString('fr-FR')} <span className="text-sm font-bold">FCFA</span>
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}