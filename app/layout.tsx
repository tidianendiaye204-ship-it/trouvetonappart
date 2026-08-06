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
import FooterWrapper from '@/components/FooterWrapper'

export const viewport: Viewport = {
  themeColor: '#4F46E5',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://trouvetonappartement.sn'),
  title: 'Trouve ton appartement',
  description: 'Trouvez facilement un appartement ou une maison au Sénégal',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trouve Appart',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: '/',
    title: 'Trouve ton appartement au Sénégal',
    description: 'La meilleure plateforme pour louer, acheter ou vendre votre bien immobilier au Sénégal (Dakar, Thiès, Saly...).',
    siteName: 'Trouve ton appartement',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${ibmPlexSans.variable}`}>
      <head>
        <link rel="icon" href="/icons/icon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Trouve Appart" />
      </head>
      <body className="flex flex-col min-h-screen font-body bg-sable-fond text-quasi-noir">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://trouvetonappartement.sn/#website",
                  "url": "https://trouvetonappartement.sn/",
                  "name": "Trouve ton appartement",
                  "description": "Trouvez facilement un appartement ou une maison au Sénégal",
                  "potentialAction": [{
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://trouvetonappartement.sn/recherche?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }]
                },
                {
                  "@type": "Organization",
                  "@id": "https://trouvetonappartement.sn/#organization",
                  "name": "TrouveTonAppartement.sn",
                  "url": "https://trouvetonappartement.sn/",
                  "logo": "https://trouvetonappartement.sn/icon.svg",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+221770000000",
                    "contactType": "customer service",
                    "areaServed": "SN",
                    "availableLanguage": "French"
                  }
                }
              ]
            })
          }}
        />
      </body>
    </html>
  )
}
