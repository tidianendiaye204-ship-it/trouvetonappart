import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Home, Wallet, ShieldAlert, FileClock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Administration | TrouveTonAppartement',
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, statut_compte')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.statut_compte !== 'actif') {
    redirect('/')
  }

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Utilisateurs', icon: Users, href: '/admin/utilisateurs' },
    { label: 'Annonces', icon: Home, href: '/admin/annonces' },
    { label: 'Transactions', icon: Wallet, href: '/admin/transactions' },
    { label: 'Signalements', icon: ShieldAlert, href: '/admin/signalements' },
    { label: 'Logs Actions', icon: FileClock, href: '/admin/logs' },
  ]

  return (
    <div className="min-h-screen bg-sable-fond flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-quasi-noir text-white shrink-0 md:min-h-screen border-r border-ardoise-gris/10 p-6 flex flex-col">
        <div className="mb-10">
          <h2 className="font-display font-black text-2xl tracking-tight text-white mb-1">
            TrouveTonAppart
          </h2>
          <p className="text-xs font-bold text-safran-accent uppercase tracking-widest">
            Back-Office
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <Icon className="w-5 h-5 text-ardoise-gris" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-white/10">
          <Link href="/" className="text-xs text-ardoise-gris hover:text-white transition-colors flex items-center gap-2">
            ← Retour au site
          </Link>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
