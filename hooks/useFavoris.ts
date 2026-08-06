'use client'

import { useState, useEffect } from 'react'

export function useFavoris() {
  const [favoris, setFavoris] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Initial load from local storage
    const stored = localStorage.getItem('trouveappart_favoris')
    if (stored) {
      try {
        setFavoris(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse favoris from local storage', e)
      }
    }
    setIsLoaded(true)

    // Listen for changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'trouveappart_favoris' && e.newValue) {
        setFavoris(JSON.parse(e.newValue))
      }
    }
    window.addEventListener('storage', handleStorage)
    
    // Custom event for same-tab updates
    const handleCustomEvent = () => {
       const updated = localStorage.getItem('trouveappart_favoris')
       if (updated) {
         setFavoris(JSON.parse(updated))
       }
    }
    window.addEventListener('favoris-updated', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('favoris-updated', handleCustomEvent)
    }
  }, [])

  const toggleFavori = (bienId: string) => {
    setFavoris(prev => {
      const isFav = prev.includes(bienId)
      const newFavs = isFav ? prev.filter(id => id !== bienId) : [...prev, bienId]
      localStorage.setItem('trouveappart_favoris', JSON.stringify(newFavs))
      window.dispatchEvent(new Event('favoris-updated'))
      return newFavs
    })
  }

  const isFavori = (bienId: string) => favoris.includes(bienId)

  return { favoris, toggleFavori, isFavori, isLoaded }
}
