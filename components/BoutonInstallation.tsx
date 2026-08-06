'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share, PlusSquare, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null
  }
}

export default function BoutonInstallation() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsIos(ios)

    // App déjà installée
    if (standalone || localStorage.getItem('appInstalled') === 'true') {
      setIsInstalled(true)
      return
    }

    // ✅ FIX TIMING : lire depuis window.__pwaInstallPrompt capturé dans le script inline du layout
    // Ce prompt a été capturé AVANT que React hydrate, donc on ne le rate plus jamais
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt)
    }

    // Écouter aussi l'événement custom au cas où Chrome émet le prompt APRÈS React
    const handleInstallable = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt)
      }
    }

    // Écouter l'événement natif (au cas où il arrive après hydration)
    const handleNativePrompt = (e: Event) => {
      e.preventDefault()
      window.__pwaInstallPrompt = e as BeforeInstallPromptEvent
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      window.__pwaInstallPrompt = null
      localStorage.setItem('appInstalled', 'true')
    }

    window.addEventListener('pwa-installable', handleInstallable)
    window.addEventListener('beforeinstallprompt', handleNativePrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable)
      window.removeEventListener('beforeinstallprompt', handleNativePrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleClick = async () => {
    if (deferredPrompt) {
      // ✅ Android / Chrome Desktop → prompt natif d'installation directe
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setIsInstalled(true)
          localStorage.setItem('appInstalled', 'true')
        }
      } catch {
        // Si le prompt échoue, afficher les instructions
        setShowModal(true)
      }
      setDeferredPrompt(null)
      window.__pwaInstallPrompt = null
    } else {
      // iOS Safari ou navigateur sans support → modal d'instructions
      setShowModal(true)
    }
  }

  if (isInstalled) return null

  return (
    <>
      {/* Bouton navbar — toujours visible */}
      <button
        id="btn-installer-app"
        onClick={handleClick}
        aria-label="Installer l'application"
        className="flex items-center gap-1.5 bg-indigo-principal text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-indigo-principal/30 hover:shadow-indigo-principal/50 hover:-translate-y-0.5 transition-all active:scale-95 animate-pulse-slow"
        title="Installer l'app sur votre téléphone"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        {/* Sur Android/Chrome avec le prompt disponible → label direct */}
        {deferredPrompt ? (
          <>
            <span className="hidden sm:inline">Installer l&apos;app</span>
            <span className="sm:hidden">Installer</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Installer</span>
            <span className="sm:hidden">App</span>
          </>
        )}
      </button>

      {/* ── Modal instructions ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-sm mx-4 mb-0 sm:mb-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-indigo-principal px-6 pt-6 pb-8 text-white relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Trouve Appart"
                  width={56}
                  height={56}
                  className="rounded-2xl shadow-lg"
                />
                <div>
                  <h2 className="text-lg font-black leading-tight">Installer l&apos;app</h2>
                  <p className="text-sm text-white/80 mt-0.5">Accès rapide depuis l&apos;écran d&apos;accueil</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {isIos ? (
                /* ── iPhone / iPad ── */
                <>
                  <p className="text-sm text-ardoise-gris font-medium text-center">
                    Suivez ces 3 étapes dans <span className="font-black text-quasi-noir">Safari</span>
                  </p>

                  <div className="flex items-start gap-4 bg-sable-fond rounded-2xl p-4">
                    <div className="w-9 h-9 bg-indigo-principal rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Share className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-quasi-noir">Étape 1 — Partager</p>
                      <p className="text-xs text-ardoise-gris mt-0.5 leading-relaxed">
                        Appuyez sur l&apos;icône <span className="font-bold text-indigo-principal">Partager</span> (carré avec flèche ↑) en bas de Safari
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-sable-fond rounded-2xl p-4">
                    <div className="w-9 h-9 bg-indigo-principal rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <PlusSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-quasi-noir">Étape 2 — Ajouter</p>
                      <p className="text-xs text-ardoise-gris mt-0.5 leading-relaxed">
                        Faites défiler et appuyez sur <span className="font-bold text-indigo-principal">« Sur l&apos;écran d&apos;accueil »</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-sable-fond rounded-2xl p-4">
                    <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white font-black text-base">✓</span>
                    </div>
                    <div>
                      <p className="font-black text-sm text-quasi-noir">Étape 3 — Confirmer</p>
                      <p className="text-xs text-ardoise-gris mt-0.5 leading-relaxed">
                        Appuyez sur <span className="font-bold text-indigo-principal">« Ajouter »</span> en haut à droite. L&apos;icône apparaît !
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <span className="text-lg">⚠️</span>
                    <p className="text-xs text-amber-800 font-medium">
                      Nécessite <span className="font-black">Safari</span> — pas Chrome ni Firefox sur iPhone.
                    </p>
                  </div>
                </>
              ) : (
                /* ── Android / autres ── */
                <>
                  <p className="text-sm text-ardoise-gris font-medium text-center">
                    Instructions pour <span className="font-black text-quasi-noir">Android Chrome</span>
                  </p>

                  <div className="flex items-start gap-4 bg-sable-fond rounded-2xl p-4">
                    <div className="w-9 h-9 bg-indigo-principal rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <MoreHorizontal className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-quasi-noir">Étape 1 — Menu Chrome</p>
                      <p className="text-xs text-ardoise-gris mt-0.5 leading-relaxed">
                        Appuyez sur les <span className="font-bold text-indigo-principal">⋮ 3 points</span> en haut à droite de Chrome
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-sable-fond rounded-2xl p-4">
                    <div className="w-9 h-9 bg-indigo-principal rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-quasi-noir">Étape 2 — Installer</p>
                      <p className="text-xs text-ardoise-gris mt-0.5 leading-relaxed">
                        Appuyez sur <span className="font-bold text-indigo-principal">« Ajouter à l&apos;écran d&apos;accueil »</span> ou <span className="font-bold text-indigo-principal">« Installer l&apos;app »</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-sable-fond rounded-2xl p-4">
                    <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white font-black text-base">✓</span>
                    </div>
                    <div>
                      <p className="font-black text-sm text-quasi-noir">Étape 3 — Confirmer</p>
                      <p className="text-xs text-ardoise-gris mt-0.5 leading-relaxed">
                        Appuyez sur <span className="font-bold text-indigo-principal">« Installer »</span>. L&apos;icône apparaît sur votre écran d&apos;accueil !
                      </p>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-indigo-principal text-white rounded-2xl py-3.5 font-black text-sm hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-indigo-principal/30"
              >
                J&apos;ai compris !
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes pulseSlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(79,70,229,0.3); }
          50%       { box-shadow: 0 4px 28px rgba(79,70,229,0.6); }
        }
        .animate-pulse-slow { animation: pulseSlow 2.5s ease-in-out infinite; }
      `}</style>
    </>
  )
}
