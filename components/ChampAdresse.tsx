'use client'

import { useRef, useState, useEffect } from 'react'
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react'

type AdresseSelectionnee = {
  adresse: string
  ville: string | null
  quartier: string | null
  latitude: number
  longitude: number
}

type GeocodingResult = {
  id: string
  latitude: number
  longitude: number
  adresse: string
  ville: string | null
  quartier: string | null
}

export default function ChampAdresse({
  onSelect,
}: {
  onSelect: (val: AdresseSelectionnee) => void
}) {
  const [valeur, setValeur] = useState('')
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [afficherSuggestions, setAfficherSuggestions] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAfficherSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (valeur.length < 3) {
      setSuggestions([])
      setError(null)
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // DEBOUNCE : On attend 800ms (idéal pour mobile/connexion lente) avant de lancer la recherche
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(valeur)}`)
        
        if (!res.ok) {
          if (res.status === 429) throw new Error('Trop de requêtes, ralentissez.')
          throw new Error('Service indisponible')
        }

        const data: GeocodingResult[] = await res.json()
        setSuggestions(data)
        
        if (data.length === 0) {
          setError('Aucune adresse trouvée')
        }
      } catch (err: any) {
        console.error('Erreur lors de la recherche', err)
        setError(err.message || 'Erreur de recherche')
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 800)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [valeur])

  function handleSelect(place: GeocodingResult) {
    setValeur(place.adresse)
    setSuggestions([])
    setAfficherSuggestions(false)

    onSelect({
      adresse: place.adresse,
      ville: place.ville,
      quartier: place.quartier,
      latitude: place.latitude,
      longitude: place.longitude,
    })
  }

  return (
    <div className="relative" ref={menuRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-ardoise-gris" />
        </div>
        <input
          type="text"
          value={valeur}
          onChange={(e) => {
            setValeur(e.target.value)
            setAfficherSuggestions(true)
          }}
          onFocus={() => setAfficherSuggestions(true)}
          placeholder="Ex: Rue 10, Dakar..."
          className="w-full rounded-xl border border-ardoise-gris/20 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-principal focus:border-transparent transition-all"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-indigo-principal animate-spin" />
          </div>
        )}
      </div>
      
      {afficherSuggestions && (valeur.length >= 3) && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-ardoise-gris/10 overflow-hidden max-h-60 overflow-y-auto">
          
          {error ? (
            <div className="p-4 text-center flex flex-col items-center gap-2 text-ardoise-gris">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span className="text-sm">{error}</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="divide-y divide-ardoise-gris/5">
              {suggestions.map((place) => (
                <li
                  key={place.id}
                  onClick={() => handleSelect(place)}
                  className="px-4 py-3 hover:bg-sable-fond cursor-pointer transition-colors flex items-start gap-3 active:bg-indigo-50"
                  // min-h-[44px] implicite via py-3 pour respecter les normes "Tap Target" mobile
                >
                  <MapPin className="w-5 h-5 text-indigo-principal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-quasi-noir">{place.adresse.split(',')[0]}</p>
                    <p className="text-xs text-ardoise-gris truncate">{place.adresse}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading && (
            <div className="p-4 text-center text-sm text-ardoise-gris">
              Recherche en cours...
            </div>
          )}
        </div>
      )}
    </div>
  )
}