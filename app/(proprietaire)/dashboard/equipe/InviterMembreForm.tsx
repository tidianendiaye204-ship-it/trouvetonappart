'use client'

import { useState } from 'react'
import { inviterMembre } from '@/app/actions/equipe'
import { Loader2, Send } from 'lucide-react'

export default function InviterMembreForm({ agenceId }: { agenceId: string }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('agent')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage(null)

    const res = await inviterMembre(agenceId, email, role)
    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Invitation envoyée' })
      setEmail('')
    } else {
      setMessage({ type: 'error', text: res.error || 'Erreur lors de l\'invitation' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">
          Email du collaborateur
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="collegue@agence.sn"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">
          Rôle
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all appearance-none"
        >
          <option value="agent" className="text-black">Agent (Gère les annonces et leads)</option>
          <option value="comptable" className="text-black">Comptable (Gère les loyers)</option>
          <option value="lecture_seule" className="text-black">Lecture seule</option>
          <option value="admin" className="text-black">Administrateur</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full flex justify-center items-center gap-2 bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50 mt-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>Envoyer l'invitation <Send className="w-4 h-4" /></>
        )}
      </button>
    </form>
  )
}
