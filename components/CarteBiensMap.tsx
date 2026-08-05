'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Bien } from '@/types'

// Couleurs du design system (valeurs HEX car les divIcon ne passent pas par Tailwind/CSS vars)
const INDIGO = '#1B2A4A'
const BLANC = '#FFFFFF'
const WA_GREEN = '#25D366'

// ─────────────────────────────────────────────────────────────────────────────
// Icône SVG WhatsApp officielle (monochrome, utilisable en inline style)
// ─────────────────────────────────────────────────────────────────────────────
function IconWhatsApp({ size = 16 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={WA_GREEN}
            aria-hidden="true"
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// BUG #2 CORRIGÉ : MapBoundsFitter
// Composant interne (doit être à l'intérieur de <MapContainer>) qui utilise
// useMap() pour appeler fitBounds() chaque fois que la liste de biens change.
// ─────────────────────────────────────────────────────────────────────────────
function MapBoundsFitter({ biens }: { biens: Bien[] }) {
    const map = useMap()
    const prevBiensRef = useRef<string>('')

    useEffect(() => {
        const biensAvecCoords = biens.filter((b) => b.latitude !== null && b.longitude !== null)
        if (biensAvecCoords.length === 0) return

        // Signature simple pour éviter de refiter si les biens n'ont pas changé
        const signature = biensAvecCoords.map((b) => b.id).join(',')
        if (signature === prevBiensRef.current) return
        prevBiensRef.current = signature

        const bounds = L.latLngBounds(
            biensAvecCoords.map((b) => [b.latitude!, b.longitude!] as [number, number])
        )

        if (biensAvecCoords.length === 1) {
            // Un seul bien : centrer + zoom fixe pour ne pas trop zoomer
            map.setView([biensAvecCoords[0].latitude!, biensAvecCoords[0].longitude!], 14, {
                animate: true,
            })
        } else {
            // Plusieurs biens : fitBounds avec padding pour ne pas coller aux bords
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true })
        }
    }, [biens, map])

    return null
}

/**
 * Crée un DivIcon Leaflet composite :
 *  - miniature photo circulaire du bien (ou icône maison sur fond indigo si pas de photo)
 *  - badge prix en dessous, centré
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
        <div style="
          background:${BLANC};
          border-radius:50%;
          padding:2px;
          transition:transform 0.2s ease;
        " class="map-marker-photo">
          ${photoHtml}
        </div>

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

    // Pré-calcul mémorisé de toutes les icônes
    const icones = useMemo(
        () =>
            biensAvecCoords.reduce<Record<string, L.DivIcon>>((acc, b) => {
                acc[b.id] = createPhotoIcon(b.image_principale, b.prix, b.transaction)
                return acc
            }, {}),
        [biensAvecCoords]
    )

    // Centre initial (avant que fitBounds prenne le relai)
    const centreInitial: [number, number] = biensAvecCoords[0]
        ? [biensAvecCoords[0].latitude!, biensAvecCoords[0].longitude!]
        : CENTRE_DEFAUT

    if (!mounted) {
        return <div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />
    }

    return (
        <MapContainer
            center={centreInitial}
            zoom={biensAvecCoords.length > 0 ? 12 : 10}
            className="h-full w-full rounded-xl z-0 shadow-inner"
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">Carto</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* ── Bug #2 corrigé : ajustement automatique de la vue ── */}
            <MapBoundsFitter biens={biens} />

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
                        <div style={{ width: '260px', borderRadius: '16px', overflow: 'hidden', background: BLANC, fontFamily: 'inherit' }}>
                            {/* ── Image ── */}
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

                                {/* Badges */}
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

                            {/* ── Corps texte ── */}
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

                                {/* ── Bug #1 corrigé : boutons contact (téléphone / WhatsApp) ── */}
                                {(bien.telephone || bien.whatsapp) && (
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                        {bien.telephone && (
                                            <a
                                                href={`tel:${bien.telephone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                                    background: `${INDIGO}15`, color: INDIGO,
                                                    borderRadius: '999px', padding: '6px 4px',
                                                    fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                                    border: `1px solid ${INDIGO}20`,
                                                }}
                                            >
                                                {/* Icône téléphone SVG */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.06 6.06l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                                Appeler
                                            </a>
                                        )}
                                        {bien.whatsapp && (
                                            <a
                                                href={`https://wa.me/${bien.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                                    background: `${WA_GREEN}15`, color: WA_GREEN,
                                                    borderRadius: '999px', padding: '6px 4px',
                                                    fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                                    border: `1px solid ${WA_GREEN}25`,
                                                }}
                                            >
                                                {/* ── Vrai logo WhatsApp SVG ── */}
                                                <IconWhatsApp size={14} />
                                                WhatsApp
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