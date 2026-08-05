'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { Bien } from '@/types'

// Couleurs design system
const INDIGO = '#1B2A4A'
const BLANC = '#FFFFFF'
const WA_GREEN = '#25D366'

// ─────────────────────────────────────────────────────────────────────────────
// Icône SVG WhatsApp officielle
// ─────────────────────────────────────────────────────────────────────────────
function IconWhatsApp({ size = 16 }: { size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={WA_GREEN} aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Ajustement automatique de la vue (fitBounds)
// ─────────────────────────────────────────────────────────────────────────────
function MapBoundsFitter({ biens }: { biens: Bien[] }) {
    const map = useMap()
    const prevSignatureRef = useRef<string>('')

    useEffect(() => {
        const avecCoords = biens.filter((b) => b.latitude !== null && b.longitude !== null)
        if (avecCoords.length === 0) return

        const signature = avecCoords.map((b) => b.id).join(',')
        if (signature === prevSignatureRef.current) return
        prevSignatureRef.current = signature

        if (avecCoords.length === 1) {
            map.setView([avecCoords[0].latitude!, avecCoords[0].longitude!], 14, { animate: true })
        } else {
            const bounds = L.latLngBounds(avecCoords.map((b) => [b.latitude!, b.longitude!] as [number, number]))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true })
        }
    }, [biens, map])

    return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Cluster layer — intégration leaflet.markercluster dans react-leaflet v5
// On crée le groupe de clusters manuellement, on y ajoute les markers,
// et on l'ajoute/retire de la carte via les hooks useEffect + useMap.
// ─────────────────────────────────────────────────────────────────────────────
type ClusterLayerProps = {
    biens: Bien[]
    icones: Record<string, L.DivIcon>
    onMarkerClick: (bien: Bien, latlng: L.LatLng) => void
}

function ClusterLayer({ biens, icones, onMarkerClick }: ClusterLayerProps) {
    const map = useMap()
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)

    useEffect(() => {
        // Importer dynamiquement pour éviter les problèmes SSR
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const L_cluster = require('leaflet.markercluster')
        void L_cluster // eviter unused warning

        // Créer ou recréer le cluster group avec les styles indigo
        if (clusterGroupRef.current) {
            map.removeLayer(clusterGroupRef.current)
        }

        const group = L.markerClusterGroup({
            maxClusterRadius: 60,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: true,
            disableClusteringAtZoom: 16,
            // Icône de cluster personnalisée — cercle indigo avec compteur
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount()
                const size = count < 10 ? 42 : count < 100 ? 50 : 58
                return L.divIcon({
                    html: `<div style="
                        width:${size}px;height:${size}px;
                        background:${INDIGO};
                        border:3px solid ${BLANC};
                        border-radius:50%;
                        display:flex;align-items:center;justify-content:center;
                        color:${BLANC};font-weight:900;font-size:${count < 10 ? 14 : 12}px;
                        box-shadow:0 4px 14px rgba(27,42,74,0.45);
                        cursor:pointer;
                    ">${count}</div>`,
                    className: 'bg-transparent border-0',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                })
            },
        })

        // Ajouter les marqueurs individuels dans le groupe
        biens
            .filter((b) => b.latitude !== null && b.longitude !== null)
            .forEach((bien) => {
                const icon = icones[bien.id]
                if (!icon) return
                const marker = L.marker([bien.latitude!, bien.longitude!], { icon })
                marker.on('click', () => {
                    onMarkerClick(bien, marker.getLatLng())
                })
                group.addLayer(marker)
            })

        map.addLayer(group)
        clusterGroupRef.current = group

        return () => {
            if (clusterGroupRef.current) {
                map.removeLayer(clusterGroupRef.current)
                clusterGroupRef.current = null
            }
        }
    }, [biens, icones, map, onMarkerClick])

    return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Icône DivIcon photo + badge prix
// ─────────────────────────────────────────────────────────────────────────────
const createPhotoIcon = (imageSrc: string | null | undefined, prix: number, transaction: string) => {
    const prixFormate = `${prix.toLocaleString('fr-FR')} FCFA`
    const suffixe = transaction === 'location' ? '/mois' : ''

    const photoHtml = imageSrc
        ? `<img src="${imageSrc}" alt="bien" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:3px solid ${BLANC};box-shadow:0 4px 12px rgba(0,0,0,0.25);display:block;" />`
        : `<div style="width:52px;height:52px;border-radius:50%;background:${INDIGO};border:3px solid ${BLANC};box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${BLANC}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
               <polyline points="9 22 9 12 15 12 15 22"/>
             </svg>
           </div>`

    const html = `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);filter:drop-shadow(0 2px 6px rgba(0,0,0,0.18));cursor:pointer;">
        <div class="map-marker-photo" style="background:${BLANC};border-radius:50%;padding:2px;transition:transform 0.2s ease;">
          ${photoHtml}
        </div>
        <div style="margin-top:4px;background:${INDIGO};color:${BLANC};font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;border:2px solid ${BLANC};box-shadow:0 2px 6px rgba(0,0,0,0.2);white-space:nowrap;letter-spacing:0.01em;line-height:1.3;">
          ${prixFormate}${suffixe ? `<span style="font-weight:600;opacity:0.75;font-size:8px;"> ${suffixe}</span>` : ''}
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${INDIGO};margin-top:-2px;"></div>
      </div>
    `

    return L.divIcon({ className: 'bg-transparent border-0', html, iconSize: [0, 0], iconAnchor: [0, 0] })
}


// ─────────────────────────────────────────────────────────────────────────────
// Popup manuel — s'affiche au clic sur un marqueur dans le cluster
// (on ne peut pas utiliser <Popup> react-leaflet dans un cluster natif Leaflet,
//  donc on gère l'ouverture manuellement via un state React)
// ─────────────────────────────────────────────────────────────────────────────
type PopupState = { bien: Bien; latlng: L.LatLng } | null

function ManualPopup({ state, onClose }: { state: PopupState; onClose: () => void }) {
    const map = useMap()
    const popupRef = useRef<L.Popup | null>(null)

    useEffect(() => {
        if (!state) {
            popupRef.current?.remove()
            return
        }

        // Créer un conteneur DOM et le monter dans un popup Leaflet
        const container = document.createElement('div')
        container.style.width = '260px'
        container.innerHTML = '' // sera rempli par le render React ci-dessous

        const popup = L.popup({ closeButton: true, offset: [0, -30], maxWidth: 280, className: 'leaflet-popup-annonce' })
            .setLatLng(state.latlng)
            .setContent(buildPopupHTML(state.bien))
            .openOn(map)

        popup.on('remove', onClose)
        popupRef.current = popup

        return () => {
            popup.remove()
        }
    }, [state, map, onClose])

    return null
}

/** Génère le HTML statique du popup (pas de JSX, car injecté dans Leaflet DOM) */
function buildPopupHTML(bien: Bien): string {
    const prixLabel = bien.transaction === 'location' ? 'Prix mensuel' : 'Prix demandé'
    const transLabel = bien.transaction === 'location' ? 'À Louer' : 'À Vendre'
    const mois = bien.transaction === 'location' ? ' /mois' : ''
    const localisation = [bien.quartier, bien.ville].filter(Boolean).join(', ')

    const imgSection = bien.image_principale
        ? `<div style="position:relative;height:140px;overflow:hidden;background:#F5F3EE;">
             <img src="${bien.image_principale}" alt="${bien.titre}" style="width:100%;height:100%;object-fit:cover;display:block;" />
             <div style="position:absolute;top:8px;left:8px;display:flex;gap:4px;">
               <span style="background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);color:${INDIGO};padding:2px 8px;border-radius:999px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;box-shadow:0 1px 4px rgba(0,0,0,0.12)">${transLabel}</span>
               ${bien.type ? `<span style="background:rgba(15,23,32,0.72);backdrop-filter:blur(6px);color:${BLANC};padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;text-transform:capitalize;">${bien.type}</span>` : ''}
             </div>
           </div>`
        : `<div style="height:80px;background:#F5F3EE;display:flex;align-items:center;justify-content:center;color:#8B93A1;font-size:12px;font-weight:600;gap:6px;">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
             Pas de photo
           </div>`

    const locSection = localisation
        ? `<p style="font-size:11px;color:#8B93A1;margin-bottom:8px;display:flex;align-items:center;gap:3px;">
             <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
             ${localisation}
           </p>`
        : ''

    const telBtn = bien.telephone
        ? `<a href="tel:${bien.telephone}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:${INDIGO}15;color:${INDIGO};border-radius:999px;padding:6px 4px;font-size:11px;font-weight:700;text-decoration:none;border:1px solid ${INDIGO}20;">
             <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.06 6.06l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
             Appeler
           </a>`
        : ''

    const waBtn = bien.whatsapp
        ? `<a href="https://wa.me/${(bien.whatsapp || '').replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:${WA_GREEN}15;color:${WA_GREEN};border-radius:999px;padding:6px 4px;font-size:11px;font-weight:700;text-decoration:none;border:1px solid ${WA_GREEN}25;">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="${WA_GREEN}"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
             WhatsApp
           </a>`
        : ''

    const contactRow = (telBtn || waBtn)
        ? `<div style="display:flex;gap:6px;margin-bottom:8px;">${telBtn}${waBtn}</div>`
        : ''

    return `
      <div style="width:260px;border-radius:16px;overflow:hidden;background:${BLANC};font-family:inherit;">
        ${imgSection}
        <div style="padding:12px 14px 14px;">
          <p style="font-weight:800;font-size:14px;color:#0F1720;margin-bottom:2px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${bien.titre}</p>
          ${locSection}
          <div style="margin-bottom:10px;">
            <p style="font-size:9px;color:#8B93A1;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1px;">${prixLabel}</p>
            <p style="font-size:18px;font-weight:900;color:${INDIGO};line-height:1.1;">
              ${bien.prix.toLocaleString('fr-FR')} <span style="font-size:12px;font-weight:700;">FCFA</span><span style="font-size:11px;font-weight:600;color:#8B93A1;">${mois}</span>
            </p>
          </div>
          ${contactRow}
          <a href="/annonce/${bien.id}" style="display:block;text-align:center;text-decoration:none;background:${INDIGO};color:${BLANC};border-radius:999px;padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:0.02em;">
            Voir l'annonce →
          </a>
        </div>
      </div>
    `
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────
const CENTRE_DEFAUT: [number, number] = [14.6937, -17.4441]

export default function CarteBiens({ biens }: { biens: Bien[] }) {
    const [mounted, setMounted] = useState(false)
    const [popupState, setPopupState] = useState<PopupState>(null)

    useEffect(() => {
        setMounted(true)
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

    const icones = useMemo(
        () =>
            biensAvecCoords.reduce<Record<string, L.DivIcon>>((acc, b) => {
                acc[b.id] = createPhotoIcon(b.image_principale, b.prix, b.transaction)
                return acc
            }, {}),
        [biensAvecCoords]
    )

    const centreInitial: [number, number] = biensAvecCoords[0]
        ? [biensAvecCoords[0].latitude!, biensAvecCoords[0].longitude!]
        : CENTRE_DEFAUT

    const handleMarkerClick = useMemo(
        () => (bien: Bien, latlng: L.LatLng) => setPopupState({ bien, latlng }),
        []
    )
    const handlePopupClose = useMemo(() => () => setPopupState(null), [])

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

            {/* Auto-zoom sur tous les biens */}
            <MapBoundsFitter biens={biens} />

            {/* Clustering des marqueurs */}
            <ClusterLayer
                biens={biensAvecCoords}
                icones={icones}
                onMarkerClick={handleMarkerClick}
            />

            {/* Popup manuel au clic (compatible avec le cluster natif Leaflet) */}
            <ManualPopup state={popupState} onClose={handlePopupClose} />
        </MapContainer>
    )
}