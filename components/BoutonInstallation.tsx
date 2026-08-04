'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export default function BoutonInstallation() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI notify the user they can install the PWA
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Optionally, check if the app is already installed
    window.addEventListener('appinstalled', () => {
      setIsVisible(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsVisible(false)
      }
      setDeferredPrompt(null)
    } else {
      // Fallback for iOS or if already installed / not supported
      alert("Pour installer l'application sur votre téléphone :\n\n- Sur iPhone (Safari) : Appuyez sur l'icône 'Partager' (carré avec une flèche) puis sur 'Sur l'écran d'accueil'.\n- Sur Android (Chrome) : Appuyez sur les 3 petits points en haut à droite, puis 'Ajouter à l'écran d'accueil'.")
    }
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 sm:gap-2 bg-quasi-noir text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
      title="Installer l'application sur votre appareil"
    >
      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Installer l'App</span>
      <span className="sm:hidden">Installer</span>
    </button>
  )
}
