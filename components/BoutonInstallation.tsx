'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export default function BoutonInstallation() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  // Initialise visibility based on persisted flag or standalone mode
  useEffect(() => {
    // If the app is already running as a PWA, never show the button
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false)
      return
    }
    // Persisted flag from a previous successful installation
    if (localStorage.getItem('appInstalled') === 'true') {
      setIsVisible(false)
      return
    }
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }
    const handleAppInstalled = () => {
      setIsVisible(false)
      setDeferredPrompt(null)
      localStorage.setItem('appInstalled', 'true')
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsVisible(false)
        localStorage.setItem('appInstalled', 'true')
      }
      setDeferredPrompt(null)
    } else {
      alert(
        "Pour installer l'application sur votre téléphone :\n\n- iPhone (Safari) : Appuyez sur l'icône 'Partager' (carré avec une flèche) puis sur 'Sur l'écran d'accueil'.\n- Android (Chrome) : Appuyez sur les 3 points en haut à droite, puis 'Ajouter à l'écran d'accueil'."
      )
    }
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleInstallClick}
      aria-label="Installer l'application"
      className="flex items-center gap-1.5 sm:gap-2 bg-quasi-noir text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
      title="Installer l'application sur votre appareil"
    >
      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Installer l'App</span>
      <span className="sm:hidden">Installer</span>
    </button>
  )
}
