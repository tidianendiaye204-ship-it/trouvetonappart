'use client';

import { Download, Share, PlusSquare, X } from 'lucide-react';
import { useState, useEffect } from 'react';

// Define the beforeinstallprompt event type
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function BoutonInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [showIosPrompt, setShowIosPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone === true);
        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Detect iOS (iPhone, iPad, iPod)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        
        if (isIosDevice) {
            setIsIos(true);
            // On iOS, we consider it installable if not standalone, since beforeinstallprompt won't fire
            setIsInstallable(true);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstallable(false);
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowIosPrompt(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIos) {
            // iOS doesn't support the standard prompt, show our manual instructions
            setShowIosPrompt(true);
            return;
        }

        if (!deferredPrompt) {
            return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
            setIsInstallable(false);
        }
    };

    // If it's already installed, or not installable yet, don't show the button
    if (isInstalled || !isInstallable) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md sm:mx-0">
            <button
                onClick={handleInstallClick}
                className="group relative flex items-center justify-center gap-3 w-full py-4 px-8 bg-indigo-principal text-white font-black text-xl rounded-2xl shadow-[0_0_40px_-10px_rgba(27,42,74,0.6)] hover:shadow-[0_0_60px_-15px_rgba(27,42,74,0.8)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                <Download className="w-6 h-6 animate-bounce" />
                <span>Installer l'Application</span>
            </button>

            {/* Modal for iOS Instructions */}
            {showIosPrompt && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowIosPrompt(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowIosPrompt(false)} className="absolute top-4 right-4 p-2 bg-sable-fond rounded-full text-ardoise-gris hover:text-quasi-noir transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-6 mt-2">
                            <div className="w-16 h-16 bg-indigo-principal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Download className="w-8 h-8 text-indigo-principal" />
                            </div>
                            <h3 className="text-xl font-black text-quasi-noir mb-2">Installer sur iPhone / iPad</h3>
                            <p className="text-ardoise-gris text-sm leading-relaxed">
                                Apple ne permet pas l'installation directe. Voici comment faire :
                            </p>
                        </div>
                        
                        <ol className="space-y-4 mb-6 text-sm font-medium text-quasi-noir">
                            <li className="flex items-center gap-4 bg-sable-fond p-4 rounded-2xl">
                                <span className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-indigo-principal text-lg">1</span>
                                <div className="flex-1">
                                    Appuyez sur le bouton <strong className="text-indigo-principal">Partager</strong> dans la barre de votre navigateur.
                                </div>
                                <Share className="w-6 h-6 text-indigo-principal shrink-0" />
                            </li>
                            <li className="flex items-center gap-4 bg-sable-fond p-4 rounded-2xl">
                                <span className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-indigo-principal text-lg">2</span>
                                <div className="flex-1">
                                    Faites défiler et choisissez <strong className="text-indigo-principal">Sur l'écran d'accueil</strong>.
                                </div>
                                <PlusSquare className="w-6 h-6 text-indigo-principal shrink-0" />
                            </li>
                        </ol>
                        
                        <button onClick={() => setShowIosPrompt(false)} className="w-full py-4 bg-quasi-noir text-white font-bold rounded-2xl active:scale-95 transition-transform">
                            J'ai compris
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
