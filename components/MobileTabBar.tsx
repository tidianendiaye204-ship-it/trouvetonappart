'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, User } from 'lucide-react'

export default function MobileTabBar() {
  const pathname = usePathname()

  // On cache la barre sur certaines pages si nécessaire (ex: login, dashboard)
  // Mais par défaut on peut la montrer partout pour le côté "App"
  
  const navItems = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'Recherche', path: '/recherche', icon: Search },
    { name: 'Favoris', path: '/favoris', icon: Heart },
    { name: 'Compte', path: '/dashboard', icon: User },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-ardoise-gris/10 z-50 px-6 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center gap-1 min-w-16 transition-colors ${
                isActive ? 'text-indigo-principal' : 'text-ardoise-gris hover:text-quasi-noir'
              }`}
            >
              <Icon 
                className={`w-6 h-6 transition-all ${isActive ? 'scale-110' : 'scale-100'}`} 
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive && item.name !== 'Compte' && item.name !== 'Recherche' ? 'currentColor' : 'none'} 
              />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
