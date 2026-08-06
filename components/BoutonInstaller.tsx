'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

export default function BoutonInstaller() {
    const [message, setMessage] = useState<string | null>(null);

    const handleInstallClick = () => {
        setMessage('Compris');
        setTimeout(() => setMessage(null), 3000); // Hide after 3 seconds
    };

    return (
        <div className="flex flex-col items-center justify-center my-12 w-full max-w-md mx-auto px-4">
            <button
                onClick={handleInstallClick}
                className="group relative flex items-center justify-center gap-3 w-full py-4 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xl rounded-2xl shadow-[0_0_40px_-10px_rgba(99,102,241,0.8)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,1)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                <Download className="w-6 h-6 animate-bounce" />
                <span>Installer l'Application</span>
            </button>
            
            {message && (
                <div className="mt-4 px-6 py-2 bg-emerald-500 text-white font-bold rounded-full animate-fade-in shadow-lg">
                    {message}
                </div>
            )}
        </div>
    );
}
