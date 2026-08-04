'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, Mail, Save, ArrowLeft, LogOut, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('nom, telephone')
        .eq('id', user.id)
        .single()

      if (profile) {
        setNom(profile.nom || '')
        setTelephone(profile.telephone || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErreur(null)
    setSucces(false)

    if (!nom.trim()) {
      setErreur('Le nom est obligatoire.')
      setSaving(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErreur('Session expirée. Veuillez vous reconnecter.')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        nom: nom.trim(),
        telephone: telephone.trim() || null,
      })
      .eq('id', user.id)

    if (error) {
      setErreur('Erreur lors de la sauvegarde. Veuillez réessayer.')
      console.error('Erreur update profil:', error)
    } else {
      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
    }

    setSaving(false)
  }

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pt-28">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-ardoise-gris/10 rounded-xl" />
          <div className="bg-white rounded-3xl p-8 space-y-6">
            <div className="h-12 bg-ardoise-gris/10 rounded-xl" />
            <div className="h-12 bg-ardoise-gris/10 rounded-xl" />
            <div className="h-12 bg-ardoise-gris/10 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pt-28">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mes-annonces" className="inline-flex items-center text-sm font-bold text-ardoise-gris hover:text-indigo-principal transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-quasi-noir tracking-tight">Mon Profil</h1>
        <p className="text-ardoise-gris mt-2 text-lg font-medium">Gérez vos informations personnelles</p>
      </div>

      {/* Formulaire Profil */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-xl border border-ardoise-gris/10 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-principal/5 rounded-bl-full -z-10" />

        {/* Avatar / Initiales */}
        <div className="flex items-center gap-4 pb-6 border-b border-ardoise-gris/10">
          <div className="w-16 h-16 bg-indigo-principal/10 text-indigo-principal rounded-2xl flex items-center justify-center text-2xl font-black">
            {nom ? nom.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="font-display font-bold text-quasi-noir text-xl">{nom || 'Votre nom'}</h2>
            <p className="text-sm text-ardoise-gris">{email}</p>
          </div>
        </div>

        {/* Nom */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-quasi-noir mb-2">
            <User className="w-4 h-4 text-indigo-principal" />
            Nom complet
          </label>
          <input
            type="text"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 bg-sable-fond border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal focus:border-indigo-principal outline-none transition-all text-quasi-noir"
            placeholder="Ex: Mamadou Diallo"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-quasi-noir mb-2">
            <Phone className="w-4 h-4 text-indigo-principal" />
            Téléphone
          </label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full px-4 py-3 bg-sable-fond border border-ardoise-gris/30 rounded-xl focus:ring-2 focus:ring-indigo-principal focus:border-indigo-principal outline-none transition-all text-quasi-noir"
            placeholder="+221 77 123 45 67"
          />
        </div>

        {/* Email (lecture seule) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-quasi-noir mb-2">
            <Mail className="w-4 h-4 text-indigo-principal" />
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 bg-ardoise-gris/5 border border-ardoise-gris/20 rounded-xl text-ardoise-gris cursor-not-allowed"
          />
          <p className="text-xs text-ardoise-gris/60 mt-1">L'email ne peut pas être modifié</p>
        </div>

        {/* Messages */}
        {erreur && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
            {erreur}
          </div>
        )}

        {succes && (
          <div className="p-3 bg-emeraude/10 border border-emeraude/20 rounded-xl text-emeraude text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Profil mis à jour avec succès !
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-indigo-principal text-white font-bold py-3.5 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Section Déconnexion */}
      <div className="mt-6 bg-white rounded-3xl shadow-sm border border-ardoise-gris/10 p-6 sm:p-8">
        <h3 className="font-display font-bold text-quasi-noir text-lg mb-2">Session</h3>
        <p className="text-sm text-ardoise-gris mb-4">Vous êtes connecté en tant que <strong>{email}</strong></p>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2.5 text-sm font-bold transition-colors disabled:opacity-70"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </div>
  )
}
