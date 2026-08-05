import ProprietaireNav from '@/components/ProprietaireNav'

export default function ProprietaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-sable-fond pt-20">
      {/* Sidebar / Bottom Nav (Délégué au composant client) */}
      <ProprietaireNav />

      {/* Main Content Area */}
      {/* Sur desktop, on décale le contenu de la largeur de la sidebar (ml-64).
          Sur mobile, on ajoute un padding en bas (pb-20) pour ne pas cacher 
          le contenu derrière la tab bar inférieure. */}
      <div className="flex-1 md:ml-64 pb-20 md:pb-8 w-full">
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
