import Link from 'next/link'
import Image from 'next/image'
import { Edit, ExternalLink, Home } from 'lucide-react'
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
                        📞 {bien.telephone}
                      </a>
                    )}
                    {bien.whatsapp && (
                      <a href={`https://wa.me/${bien.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-xl py-2.5 text-xs font-bold transition-all">
                        💬 WhatsApp
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
                        <form action={activerSponsoring.bind(null, bien.id)}>
                            <button 
                                type="submit" 
                                className="w-full flex items-center justify-center gap-2 bg-safran-accent hover:brightness-105 text-quasi-noir rounded-xl py-2.5 text-sm font-bold shadow-sm transition-all"
                            >
                                <span className="text-lg leading-none">⭐</span> Mettre en avant
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
