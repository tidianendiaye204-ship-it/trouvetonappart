import { StatutBien } from '@/types'
import { CheckCircle2, Clock, CalendarDays, KeyRound, Home } from 'lucide-react'

export default function StatutBienBadge({ statut, className = '' }: { statut: StatutBien, className?: string }) {
  if (statut === 'disponible') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-sm ${className}`}>
        <CheckCircle2 className="w-3 h-3" />
        <span>Disponible</span>
      </div>
    )
  }

  if (statut === 'visite_en_cours') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold shadow-sm ${className}`}>
        <Clock className="w-3 h-3" />
        <span>Visite en cours</span>
      </div>
    )
  }

  if (statut === 'reserve') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold shadow-sm ${className}`}>
        <CalendarDays className="w-3 h-3" />
        <span>Réservé</span>
      </div>
    )
  }

  if (statut === 'loue') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-ardoise-gris/10 text-quasi-noir border border-ardoise-gris/20 rounded-full text-xs font-bold shadow-sm ${className}`}>
        <KeyRound className="w-3 h-3" />
        <span>Loué</span>
      </div>
    )
  }

  if (statut === 'vendu') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-ardoise-gris/10 text-quasi-noir border border-ardoise-gris/20 rounded-full text-xs font-bold shadow-sm ${className}`}>
        <Home className="w-3 h-3" />
        <span>Vendu</span>
      </div>
    )
  }

  return null
}
