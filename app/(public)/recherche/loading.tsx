// Skeleton loading affiché pendant que la page /recherche charge les données depuis Supabase
// Next.js affiche ce composant automatiquement grâce à la convention loading.tsx

export default function RechercheLoading() {
    return (
        <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-5rem)] mt-20 bg-sable-fond">
            {/* ── Colonne liste + filtres (skeleton) ── */}
            <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-r border-ardoise-gris/20 h-[50vh] lg:h-full flex flex-col">

                {/* Barre de filtres skeleton */}
                <div className="p-4 pb-0 shrink-0 space-y-2">
                    <div className="h-12 w-full bg-white rounded-2xl border border-ardoise-gris/10 animate-pulse" />
                    <div className="h-10 w-full bg-white rounded-xl border border-ardoise-gris/10 animate-pulse" />
                </div>

                {/* Header résultats skeleton */}
                <div className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
                    <div className="h-7 w-48 bg-ardoise-gris/15 rounded-lg animate-pulse" />
                    <div className="h-6 w-20 bg-ardoise-gris/10 rounded-full animate-pulse" />
                </div>

                {/* Grille de cartes skeleton */}
                <div className="px-4 pb-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCarteAnnonce key={i} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Colonne carte (skeleton) ── */}
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-full">
                <div className="h-full w-full bg-ardoise-gris/10 animate-pulse flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-ardoise-gris/30">
                        {/* Icône carte simplifiée */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                            <line x1="9" y1="3" x2="9" y2="18" />
                            <line x1="15" y1="6" x2="15" y2="21" />
                        </svg>
                        <span className="text-sm font-medium">Chargement de la carte…</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SkeletonCarteAnnonce() {
    return (
        <div className="rounded-3xl border border-ardoise-gris/10 bg-white overflow-hidden">
            {/* Image skeleton avec shimmer */}
            <div className="relative aspect-4/3 w-full bg-ardoise-gris/10 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                {/* Badge skeleton */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div className="h-5 w-16 bg-white/70 rounded-full animate-pulse" />
                </div>
            </div>
            {/* Contenu skeleton */}
            <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-ardoise-gris/15 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-ardoise-gris/10 rounded-lg animate-pulse" />
                <div className="pt-3 border-t border-ardoise-gris/10 flex flex-col gap-1.5">
                    <div className="h-3 w-20 bg-ardoise-gris/10 rounded animate-pulse" />
                    <div className="h-6 w-32 bg-ardoise-gris/15 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    )
}
