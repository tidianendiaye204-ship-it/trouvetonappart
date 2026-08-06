import Link from 'next/link'
import Image from 'next/image'
import { Edit, ExternalLink, Home, Phone } from 'lucide-react'
import { activerSponsoring } from '@/app/actions/sponsorisation'
import BoutonSupprimerBien from './BoutonSupprimerBien'

import { Bien } from '@/types'

export default function CarteBienAdmin({ bien }: { bien: Bien }) {
    const estSponsorise = bien.sponsorise_jusqu_a ? new Date(bien.sponsorise_jusqu_a) > new Date() : false;

    return (
        <div className="block rounded-3xl border border-ardoise-gris/20 bg-white overflow-hidden hover:shadow-xl hover:border-indigo-principal/30 transition-all duration-300 group">
            {/* Image & Status Badge */}
            <div className="relative h-48 w-full bg-sable-fond">
                {bien.image_principale ? (
                    <Image
                        src={bien.image_principale}
                        alt={bien.titre}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col gap-2 h-full items-center justify-center text-ardoise-gris/50">
                        <Home className="w-8 h-8" />
                        <span className="text-sm font-medium">Pas de photo</span>
                    </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${bien.publie ? 'bg-emeraude/90 text-white' : 'bg-safran-accent/90 text-quasi-noir'}`}>
                        {bien.publie ? 'En Ligne' : 'Brouillon'}
                    </span>
                    {bien.statut === 'vendu' && (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full shadow-sm backdrop-blur-md bg-indigo-principal/90 text-white">
                            Vendu
                        </span>
                    )}
                    {bien.statut === 'loue' && (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full shadow-sm backdrop-blur-md bg-indigo-principal/90 text-white">
                            Loué
                        </span>
                    )}
                    {bien.statut === 'reserve' && (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full shadow-sm backdrop-blur-md bg-safran-accent/90 text-quasi-noir">
                            Réservé
                        </span>
                    )}
                </div>

                {/* Price (bottom left over image) */}
                <div className="absolute bottom-4 left-4">
                    <span className="bg-white text-quasi-noir px-3 py-1.5 rounded-full text-sm font-black shadow-md">
                        {bien.prix.toLocaleString('fr-FR')} FCFA
                        {bien.transaction === 'location' && <span className="text-xs font-medium text-ardoise-gris"> /mois</span>}
                    </span>
                </div>
            </div>

            {/* Content & Actions */}
            <div className="p-5">
                <div className="mb-4">
                    <h3 className="font-display font-bold text-quasi-noir text-lg line-clamp-1 mb-1">{bien.titre}</h3>
                    <p className="text-sm text-ardoise-gris flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-ardoise-gris/30"></span>
                        {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville ?? ''}
                    </p>
                </div>
                
                {/* Admin Actions */}
                <div className="flex gap-2 pt-4 border-t border-ardoise-gris/10 mt-auto">
                    <Link
                        href={`/mes-annonces/${bien.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-principal/5 hover:bg-indigo-principal text-indigo-principal hover:text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </Link>
                    
                    <Link
                        href={`/annonce/${bien.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-2.5 bg-sable-fond hover:bg-ardoise-gris/10 text-ardoise-gris rounded-xl transition-colors"
                        title="Voir l'annonce publique"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </Link>

                    <BoutonSupprimerBien id={bien.id} />
                </div>

                {/* Contact Direct */}
                {(bien.telephone || bien.whatsapp) && (
                  <div className="flex gap-2 pt-4 border-t border-ardoise-gris/10">
                    {bien.telephone && (
                      <a href={`tel:${bien.telephone}`} className="flex-1 flex items-center justify-center gap-2 bg-indigo-principal/10 hover:bg-indigo-principal text-indigo-principal hover:text-white rounded-xl py-2.5 text-xs font-bold transition-all">
                        <Phone className="w-4 h-4" /> {bien.telephone}
                      </a>
                    )}
                    {bien.whatsapp && (
                      <a href={`https://wa.me/${bien.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-xl py-2.5 text-xs font-bold transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
                {/* Sponsoring Section */}
                <div className="mt-4 pt-4 border-t border-ardoise-gris/10">
                    {estSponsorise ? (
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-safran-accent flex items-center gap-1"><span className="text-lg leading-none">🌟</span> Sponsorisé</span>
                            <span className="text-xs text-ardoise-gris">Jusqu'au {new Date(bien.sponsorise_jusqu_a!).toLocaleDateString('fr-FR')}</span>
                        </div>
                    ) : (
                        <Link 
                            href={`/mes-annonces/${bien.id}/sponsoriser`}
                            className="w-full flex items-center justify-center gap-2 bg-safran-accent hover:brightness-105 text-quasi-noir rounded-xl py-2.5 text-sm font-bold shadow-sm transition-all"
                        >
                            <span className="text-lg leading-none">⭐</span> Mettre en avant
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
