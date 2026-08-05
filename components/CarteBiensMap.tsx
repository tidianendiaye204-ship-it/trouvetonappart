'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Bien } from '@/types'

// Couleurs du design system (valeurs HEX car les divIcon ne passent pas par Tailwind/CSS vars)
const INDIGO = '#1B2A4A'
const SAFRAN = '#F5A623'
const BLANC = '#FFFFFF'
const GRIS_BORD = '#E2E8F0'

/**
 * Crée un DivIcon Leaflet composite :
 *  - miniature photo circulaire du bien (ou icône maison sur fond indigo si pas de photo)
 *  - badge prix en dessous, centré
 * On utilise inline styles + SVG pour rester indépendant de Tailwind.
 */
const createPhotoIcon = (imageSrc: string | null | undefined, prix: number, transaction: string) => {
    const prixFormate = `${prix.toLocaleString('fr-FR')} FCFA`
    const suffixe = transaction === 'location' ? '/mois' : ''

    const photoHtml = imageSrc
        ? `<img
              src="${imageSrc}"
              alt="bien"
              style="
                width:52px;height:52px;border-radius:50%;
                object-fit:cover;
                border:3px solid ${BLANC};
                box-shadow:0 4px 12px rgba(0,0,0,0.25);
                display:block;
              "
           />`
        : `<div style="
              width:52px;height:52px;border-radius:50%;
              background:${INDIGO};
              border:3px solid ${BLANC};
              box-shadow:0 4px 12px rgba(0,0,0,0.25);
              display:flex;align-items:center;justify-content:center;
           ">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="${BLANC}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
               <polyline points="9 22 9 12 15 12 15 22"/>
             </svg>
           </div>`

    const html = `
      <div style="
        display:flex;flex-direction:column;align-items:center;
        transform:translate(-50%, -100%);
        filter:drop-shadow(0 2px 6px rgba(0,0,0,0.18));
        cursor:pointer;
      ">
        <!-- Photo / placeholder -->
        <div style="
          background:${BLANC};
          border-radius:50%;
          padding:2px;
          transition:transform 0.2s ease;
        " class="map-marker-photo">
          ${photoHtml}
        </div>

        <!-- Badge prix -->
        <div style="
          margin-top:4px;
          background:${INDIGO};
          color:${BLANC};
          font-size:10px;
          font-weight:800;
          padding:3px 8px;
          border-radius:999px;
          border:2px solid ${BLANC};
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          white-space:nowrap;
          letter-spacing:0.01em;
          line-height:1.3;
        ">
          ${prixFormate}${suffixe ? `<span style="font-weight:600;opacity:0.75;font-size:8px;"> ${suffixe}</span>` : ''}
        </div>

        <!-- Petite flèche -->
        <div style="
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:6px solid ${INDIGO};
          margin-top:-2px;
        "></div>
      </div>
    `

    return L.divIcon({
        className: 'bg-transparent border-0',
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    })
}

const CENTRE_DEFAUT: [number, number] = [14.6937, -17.4441] // Dakar

export default function CarteBiens({ biens }: { biens: Bien[] }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Fix icônes leaflet par défaut (nécessaire en SSR Next.js)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })
    }, [])

    const biensAvecCoords = useMemo(
        () => biens.filter((b) => b.latitude !== null && b.longitude !== null),
        [biens]
    )

    // Pré-calcul de toutes les icônes : mémorisé pour éviter les recréations à chaque render
    const icones = useMemo(
        () =>
            biensAvecCoords.reduce<Record<string, L.DivIcon>>((acc, b) => {
                acc[b.id] = createPhotoIcon(b.image_principale, b.prix, b.transaction)
                return acc
            }, {}),
        [biensAvecCoords]
    )

    const centre: [number, number] = biensAvecCoords[0]
        ? [biensAvecCoords[0].latitude!, biensAvecCoords[0].longitude!]
        : CENTRE_DEFAUT

    if (!mounted) {
        return <div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />
    }

    return (
        <MapContainer
            center={centre}
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
                    icon={icones[bien.id]}
                >
                    <Popup
                        closeButton={false}
                        offset={[0, -30]}
                        maxWidth={280}
                        className="leaflet-popup-annonce"
                    >
                        {/* Popup card */}
                        <div style={{ width: '260px', borderRadius: '16px', overflow: 'hidden', background: BLANC, fontFamily: 'inherit' }}>
                            {/* --- Image --- */}
                            <div style={{ position: 'relative', height: '140px', background: '#F5F3EE', overflow: 'hidden' }}>
                                {bien.image_principale ? (
                                    <Image
                                        src={bien.image_principale}
                                        alt={bien.titre}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="260px"
                                    />
                                ) : (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#8B93A1', gap: '6px'
                                    }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                        <span style={{ fontSize: '11px', fontWeight: 600 }}>Pas de photo</span>
                                    </div>
                                )}

                                {/* Badges superposés */}
                                <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                                    {bien.transaction && (
                                        <span style={{
                                            background: 'rgba(255,255,255,0.92)',
                                            backdropFilter: 'blur(6px)',
                                            color: INDIGO,
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
                                        }}>
                                            {bien.transaction === 'location' ? 'À Louer' : 'À Vendre'}
                                        </span>
                                    )}
                                    {bien.type && (
                                        <span style={{
                                            background: 'rgba(15,23,32,0.72)',
                                            backdropFilter: 'blur(6px)',
                                            color: BLANC,
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            textTransform: 'capitalize',
                                        }}>
                                            {bien.type}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* --- Contenu texte --- */}
                            <div style={{ padding: '12px 14px 14px' }}>
                                {/* Titre */}
                                <p style={{
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    color: '#0F1720',
                                    marginBottom: '2px',
                                    lineHeight: '1.3',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>
                                    {bien.titre}
                                </p>

                                {/* Localisation */}
                                {(bien.quartier || bien.ville) && (
                                    <p style={{
                                        fontSize: '11px',
                                        color: '#8B93A1',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                    }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville ?? ''}
                                    </p>
                                )}

                                {/* Prix */}
                                <div style={{ marginBottom: '10px' }}>
                                    <p style={{ fontSize: '9px', color: '#8B93A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1px' }}>
                                        Prix {bien.transaction === 'location' ? 'mensuel' : 'demandé'}
                                    </p>
                                    <p style={{ fontSize: '18px', fontWeight: 900, color: INDIGO, lineHeight: 1.1 }}>
                                        {bien.prix.toLocaleString('fr-FR')}{' '}
                                        <span style={{ fontSize: '12px', fontWeight: 700 }}>FCFA</span>
                                        {bien.transaction === 'location' && (
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#8B93A1' }}> /mois</span>
                                        )}
                                    </p>
                                </div>

                                {/* Boutons contact si disponibles */}
                                {(bien.telephone || bien.whatsapp) && (
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                        {bien.telephone && (
                                            <a
                                                href={`tel:${bien.telephone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                                    background: `${INDIGO}18`, color: INDIGO, borderRadius: '999px',
                                                    padding: '6px 4px', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                                }}
                                            >
                                                📞 Appeler
                                            </a>
                                        )}
                                        {bien.whatsapp && (
                                            <a
                                                href={`https://wa.me/${bien.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                                    background: '#25D36618', color: '#25D366', borderRadius: '999px',
                                                    padding: '6px 4px', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                                }}
                                            >
                                                💬 WhatsApp
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Lien "Voir l'annonce" */}
                                <Link
                                    href={`/annonce/${bien.id}`}
                                    style={{
                                        display: 'block', textAlign: 'center', textDecoration: 'none',
                                        background: INDIGO, color: BLANC,
                                        borderRadius: '999px', padding: '9px 12px',
                                        fontSize: '12px', fontWeight: 800,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    Voir l&apos;annonce →
                                </Link>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}