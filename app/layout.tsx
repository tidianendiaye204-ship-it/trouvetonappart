import './globals.css'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
})

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const viewport: Viewport = {
  themeColor: '#4F46E5',
}

export const metadata: Metadata = {
  title: 'Trouve ton appartement',
  description: 'Trouvez facilement un appartement ou une maison au Sénégal',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trouve Appart',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${ibmPlexSans.variable}`}>
      <body className="flex flex-col min-h-screen font-body bg-sable-fond text-quasi-noir">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
