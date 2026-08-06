import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Building2 } from 'lucide-react'
import BoutonNavFavoris from './BoutonNavFavoris'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-ardoise-gris/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center group">
          <Image 
            src="/logo.jpg" 
            alt="TrouveTonAppart Logo" 
            width={180} 
            height={40} 
            className="group-hover:scale-105 transition-transform h-10 w-auto object-contain mix-blend-multiply"
          />
        </Link>

        <div className="flex gap-8 items-center">
          <div className="hidden md:flex gap-8 items-center">
            <Link href="/#fonctionnalites" className="text-sm font-bold text-ardoise-gris hover:text-indigo-principal transition-colors">
              Fonctionnalités
            </Link>
            <Link href="/tarifs" className="text-sm font-bold text-ardoise-gris hover:text-indigo-principal transition-colors">
              Tarifs
            </Link>
            <Link href="/#comment-ca-marche" className="text-sm font-bold text-ardoise-gris hover:text-indigo-principal transition-colors">
              Comment ça marche
            </Link>
          </div>
          
          <div className="h-6 w-px bg-ardoise-gris/20 hidden md:block"></div>

          <Link href="/recherche" className="bg-indigo-principal text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-indigo-principal/30 hover:shadow-indigo-principal/50 hover:-translate-y-0.5 transition-all active:scale-95">
            <span className="hidden sm:inline">Trouver un bien</span>
            <span className="sm:hidden">Recherche</span>
          </Link>
          
          <BoutonNavFavoris />

          {isAdmin && (
            <Link href="/admin" className="bg-red-50 text-red-600 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:-translate-y-0.5 transition-all active:scale-95">
              Admin
            </Link>
          )}

          {user ? (
            <Link href="/dashboard" className="bg-white border-2 border-indigo-principal text-indigo-principal px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:-translate-y-0.5 transition-all active:scale-95">
              Espace Pro
            </Link>
          ) : (
            <Link href="/login" className="bg-white border-2 border-ardoise-gris/20 text-quasi-noir px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:-translate-y-0.5 transition-all active:scale-95">
              Espace Pro
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
