import Image from 'next/image'

export default function PortailLocataireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-sable-fond/50 font-body flex flex-col">
      {/* HEADER SIMPLIFIÉ */}
      <header className="bg-white border-b border-ardoise-gris/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Image 
            src="/logo.jpg" 
            alt="TrouveTonAppart Logo" 
            width={140} 
            height={32} 
            className="h-8 w-auto object-contain mix-blend-multiply"
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className="bg-indigo-50 text-indigo-principal px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Espace Locataire
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* FOOTER DISCRET */}
      <footer className="text-center py-6 text-ardoise-gris text-xs">
        <p>Propulsé par <strong>TrouveTonAppartement.sn</strong></p>
      </footer>
    </div>
  )
}
