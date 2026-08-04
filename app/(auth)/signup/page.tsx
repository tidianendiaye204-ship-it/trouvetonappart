'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [succes, setSucces] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnCours(true)
    setErreur(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      let errorMessage = error.message
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'Un compte existe déjà avec cette adresse email.'
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.'
      } else {
        errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
      }
      
      setErreur(errorMessage)
      setEnCours(false)
      return
    }

    setSucces(true)
    setEnCours(false)
  }

  if (succes) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-emeraude/20 rounded-3xl shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emeraude/5 rounded-bl-full -z-10" />
          <div className="w-16 h-16 bg-emeraude/10 text-emeraude rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-black mb-4 text-quasi-noir tracking-tight">Inscription réussie !</h1>
          <p className="mb-8 text-ardoise-gris font-medium">Veuillez vérifier vos emails pour confirmer votre compte et commencer à publier vos annonces.</p>
          <Link href="/login" className="inline-block w-full rounded-full bg-indigo-principal text-white font-bold py-3.5 hover:brightness-110 transition-all shadow-md active:scale-95">
            Aller à la page de connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-ardoise-gris/10 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-safran-accent/5 rounded-bl-full -z-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-principal/5 rounded-tr-full -z-10" />

        <h1 className="font-display text-3xl font-black mb-2 text-center text-quasi-noir tracking-tight">
          Bienvenue !
        </h1>
        <p className="text-center text-ardoise-gris font-medium mb-8">
          Créez votre espace propriétaire
        </p>
        
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
            {enCours ? 'Inscription en cours...' : "Créer mon compte"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-ardoise-gris/10 text-center text-sm text-ardoise-gris">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-principal font-bold hover:underline transition-colors">
            Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  )
}
