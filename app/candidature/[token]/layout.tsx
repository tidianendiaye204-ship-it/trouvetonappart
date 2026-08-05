import Image from 'next/image'

export default function CandidatureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-sable-fond/50 font-body flex flex-col">
      <header className="bg-white border-b border-ardoise-gris/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image 
            src="/logo.jpg" 
            alt="TrouveTonAppart Logo" 
            width={140} 
            height={32} 
            className="h-8 w-auto object-contain mix-blend-multiply"
          />
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Dépôt de Dossier
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="text-center py-6 text-ardoise-gris text-xs">
        <p>Propulsé par <strong>TrouveTonAppartement.sn</strong></p>
      </footer>
    </div>
  )
}
