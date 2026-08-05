'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building, Users, Wallet, Settings2, FileText } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mes Biens', href: '/mes-annonces', icon: Building },
  { name: 'Demandes & Contacts', href: '/demandes', icon: Users },
  { name: 'Locataires', href: '/locataires', icon: FileText },
  { name: 'Finances', href: '/finances', icon: Wallet },
  { name: 'Automatisations', href: '/automations', icon: Settings2 },
]

export default function ProprietaireNav() {
  const pathname = usePathname()

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible à partir de md) */}
      <div className="hidden md:flex flex-col w-64 fixed top-20 bottom-0 bg-white border-r border-ardoise-gris/10 z-40 overflow-y-auto pt-6">
        <div className="px-4 pb-6">
          <p className="text-xs font-bold text-ardoise-gris uppercase tracking-wider mb-4 px-2">Espace Propriétaire</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-indigo-50 text-indigo-principal' : 'text-quasi-noir hover:bg-sable-fond'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-principal' : 'text-ardoise-gris'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV (Visible jusqu'à md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ardoise-gris/10 z-50 px-2 py-2 flex justify-between items-center safe-area-pb">
        {navItems.slice(0, 5).map((item) => {
          // Sur mobile, on n'affiche que 5 éléments max pour des raisons de place
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg ${isActive ? 'text-indigo-principal' : 'text-ardoise-gris hover:bg-sable-fond'}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'fill-indigo-50 text-indigo-principal' : ''}`} />
              <span className="text-[9px] font-bold truncate w-full text-center">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
