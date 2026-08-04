'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const createPriceIcon = (prix: number) => {
    return L.divIcon({
        className: 'bg-transparent',
        html: `<div class="relative group cursor-pointer" style="transform: translate(-50%, -100%); width: max-content;">
                 <div class="bg-indigo-principal text-white px-3 py-1.5 rounded-full font-bold shadow-lg text-sm border-2 border-white group-hover:scale-110 group-hover:bg-safran-accent group-hover:text-quasi-noir transition-all duration-300">
                   ${prix.toLocaleString('fr-FR')} FCFA
                 </div>
                 <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-white drop-shadow-sm group-hover:border-t-safran-accent transition-colors duration-300"></div>
                 <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] border-t-indigo-principal group-hover:border-t-safran-accent transition-colors duration-300 z-10"></div>
               </div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    })
}

import { Bien } from '@/types'

const CENTRE_DEFAUT: [number, number] = [14.6937, -17.4441] // Dakar

export default function CarteBiens({ biens }: { biens: Bien[] }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const biensAvecCoords = useMemo(
        () => biens.filter((b) => b.latitude !== null && b.longitude !== null),
        [biens]
    )

    if (!mounted) {
        return <div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />
    }

    return (
        <MapContainer
            center={
                biensAvecCoords[0]
                    ? [biensAvecCoords[0].latitude!, biensAvecCoords[0].longitude!]
                    : CENTRE_DEFAUT
            }
            zoom={13}
            className="h-full w-full rounded-xl z-0 shadow-inner"
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">Carto</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {biensAvecCoords.map((bien) => (
                <Marker
                    key={bien.id}
                    position={[bien.latitude!, bien.longitude!]}
                    icon={createPriceIcon(bien.prix)}
                >
                    <Popup closeButton={false} offset={[0, -25]}>
                        <div className="w-64 rounded-xl overflow-hidden shadow-lg border border-ardoise-gris/10 bg-white p-0 flex flex-col -m-3.5">
                            {/* Image placeholder ou vraie image */}
                            <div className="relative h-32 bg-sable-fond w-full">
                                {bien.image_principale ? (
                                    <Image src={bien.image_principale} alt={bien.titre} fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-ardoise-gris/50">
                                        Pas de photo
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 flex gap-2">
                                    {bien.transaction && (
                                        <span className="bg-white/90 backdrop-blur-md text-quasi-noir px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            {bien.transaction === 'location' ? 'À Louer' : 'À Vendre'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-2">
                                <h3 className="font-display font-bold text-quasi-noir text-base leading-snug line-clamp-1" title={bien.titre}>
                                    {bien.titre}
                                </h3>
                                <div className="text-indigo-principal font-black text-lg">
                                    {bien.prix.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
                                </div>
                                <Link href={`/annonce/${bien.id}`} className="mt-2 w-full bg-indigo-principal text-white rounded-full py-2 text-sm font-bold hover:brightness-110 transition-all active:scale-[0.98] text-center block">
                                    Voir les détails
                                </Link>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}