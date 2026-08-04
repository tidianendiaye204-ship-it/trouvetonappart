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
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsVisible(false)
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleInstallClick}
      className="hidden sm:flex items-center gap-2 bg-quasi-noir text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
      title="Installer l'application sur votre appareil"
    >
      <Download className="w-4 h-4" />
      Installer l'App
    </button>
  )
}
