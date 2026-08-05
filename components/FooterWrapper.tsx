'use client'

import { usePathname } from 'next/navigation'

export default function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Ne pas afficher le footer sur les pages de l'espace propriétaire
  const isDashboard = [
    '/dashboard',
    '/mes-annonces',
    '/demandes',
    '/locataires',
    '/finances',
    '/automations',
    '/recherche',
    '/immobilier'
  ].some(path => pathname?.startsWith(path))

  if (isDashboard) {
    return null
  }

  return <>{children}</>
}
