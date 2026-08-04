'use client'

import { useRef, useState, useEffect } from 'react'

type AdresseSelectionnee = {
  adresse: string
  ville: string | null
  quartier: string | null
  latitude: number
  longitude: number
}

type NominatimResult = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address: {
    city?: string
    town?: string
    village?: string
    suburb?: string
    neighbourhood?: string
    [key: string]: string | undefined
  }
}

export default function ChampAdresse({
  onSelect,
}: {
  onSelect: (val: AdresseSelectionnee) => void
}) {
  const [valeur, setValeur] = useState('')
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [afficherSuggestions, setAfficherSuggestions] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (valeur.length < 3) {
      setSuggestions([])
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(valeur)}`)
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
      } catch (error) {
        console.error('Erreur lors de la recherche Nominatim', error)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [valeur])

  function handleSelect(place: NominatimResult) {
    setValeur(place.display_name)
    setSuggestions([])
    setAfficherSuggestions(false)

    const ville = place.address.city || place.address.town || place.address.village || null
    const quartier = place.address.suburb || place.address.neighbourhood || null

    onSelect({
      adresse: place.display_name,
      ville,
      quartier,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    })
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={valeur}
        onChange={(e) => {
          setValeur(e.target.value)
          setAfficherSuggestions(true)
        }}
        onFocus={() => setAfficherSuggestions(true)}
        placeholder="Entrez l'adresse du bien..."
        className="w-full rounded-md border px-3 py-2"
      />
      {loading && <div className="absolute right-3 top-2.5 text-sm text-gray-500">...</div>}
      
      {afficherSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
          {suggestions.map((sugg) => (
            <li
              key={sugg.place_id}
              onClick={() => handleSelect(sugg)}
              className="cursor-pointer border-b px-3 py-2 text-sm last:border-0 hover:bg-gray-100"
            >
              {sugg.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}