'use client'

import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { submitContact } from '@/app/actions/contact'

export default function FormulaireContact({ bienId }: { bienId: string }) {
  const [envoye, setEnvoye] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  
  // Rate limiting client state
  const [cooldown, setCooldown] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  async function clientAction(formData: FormData) {
    // Anti-spam: Client-side rate limit check
    const lastSendTime = sessionStorage.getItem('lastContactSendTime')
    if (lastSendTime) {
      const timeSinceLastSend = Date.now() - parseInt(lastSendTime, 10)
      if (timeSinceLastSend < 60000) {
        setErreur("Veuillez patienter avant d'envoyer une nouvelle demande.")
        return
      }
    }

    if (cooldown) {
        setErreur("Veuillez patienter avant d'envoyer une nouvelle demande.")
        return
    }

    setEnCours(true)
    setErreur(null)

    formData.append('bienId', bienId)
    if (captchaToken) {
      formData.append('cf-turnstile-response', captchaToken)
    }
    
    // Appel à la Server Action
    const result = await submitContact(formData)

    setEnCours(false)

    if (!result.success) {
      setErreur(result.error || "Une erreur est survenue, réessayez.")
      return
    }

    // Anti-spam: set cooldown
    sessionStorage.setItem('lastContactSendTime', Date.now().toString())
    setCooldown(true)
    setTimeout(() => setCooldown(false), 60000)

    setEnvoye(true)
  }

  if (envoye) {
    return (
      <div className="rounded-2xl bg-emeraude/10 border border-emeraude/20 p-6 text-emeraude font-medium text-center">
        Votre demande a été envoyée. Le propriétaire vous contactera bientôt.
      </div>
    )
  }

  return (
    <form action={clientAction} className="space-y-5">
      <h3 className="font-display font-bold text-quasi-noir text-xl mb-6">Contactez le propriétaire</h3>

      {/* Honeypot field - hidden from real users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-quasi-noir">Nom complet</label>
        <input
          required
          name="nom"
          className="w-full rounded-xl border border-ardoise-gris/20 bg-white px-4 py-3 focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal outline-none text-quasi-noir transition-all shadow-sm"
          placeholder="Mamadou DIOP"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-quasi-noir">Téléphone</label>
        <input
          required
          type="tel"
          name="telephone"
          className="w-full rounded-xl border border-ardoise-gris/20 bg-white px-4 py-3 focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal outline-none text-quasi-noir transition-all shadow-sm placeholder:text-ardoise-gris/40"
          placeholder="77 123 45 67"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-quasi-noir">Message (optionnel)</label>
        <textarea
          name="message"
          rows={3}
          className="w-full rounded-xl border border-ardoise-gris/20 bg-white px-4 py-3 focus:border-indigo-principal focus:ring-1 focus:ring-indigo-principal outline-none text-quasi-noir transition-all shadow-sm"
          placeholder="Je suis très intéressé par ce bien..."
        />
      </div>

      <div className="flex justify-center my-4">
        {/* Turnstile */}
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setCaptchaToken(token)}
            options={{ theme: 'light' }}
            onError={(e) => console.error('Turnstile error', e)}
          />
        ) : (
          <p className="text-sm text-ardoise-gris">
            Captcha non disponible (clé manquante).
          </p>
        )}

      </div>

      {erreur && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours || cooldown}
        className="w-full rounded-xl bg-indigo-principal text-white px-4 py-4 font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-md active:scale-[0.98] mt-2 flex justify-center items-center gap-2"
      >
        {enCours ? 'Envoi en cours...' : 'Envoyer ma demande'}
      </button>
      <p className="text-center text-xs text-ardoise-gris mt-3">Pas de frais d'agence. Contact direct.</p>
    </form>
  )
}