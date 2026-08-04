'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnCours(true)
    setErreur(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErreur(error.message)
      setEnCours(false)
      return
    }

    router.push('/mes-annonces')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-ardoise-gris/10 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-principal/5 rounded-bl-full -z-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-safran-accent/5 rounded-tr-full -z-10" />

        <h1 className="font-display text-3xl font-black mb-8 text-center text-quasi-noir tracking-tight">
          Bon retour par ici
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-quasi-noir mb-2">Adresse email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-sable-fond border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal focus:border-indigo-principal outline-none transition-all text-quasi-noir"
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-quasi-noir mb-2">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-sable-fond border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal focus:border-indigo-principal outline-none transition-all text-quasi-noir"
              placeholder="••••••••"
            />
          </div>
          
          {erreur && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium">
              {erreur}
            </div>
          )}
          
          <button
            type="submit"
            disabled={enCours}
            className="w-full rounded-full bg-indigo-principal text-white font-bold py-3.5 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] mt-6"
          >
            {enCours ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-ardoise-gris/10 text-center text-sm text-ardoise-gris">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-indigo-principal font-bold hover:underline transition-colors">
            Créez votre espace propriétaire
          </Link>
        </div>
      </div>
    </div>
  )
}
