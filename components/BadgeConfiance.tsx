import { ShieldCheck, Camera, CheckCircle2 } from 'lucide-react'

export type TrustLevel = 'owner' | 'photos' | 'availability'

interface BadgeConfianceProps {
  type: TrustLevel
  className?: string
}

export default function BadgeConfiance({ type, className = '' }: BadgeConfianceProps) {
  
  if (type === 'owner') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-linear-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold shadow-sm ${className}`}>
        <ShieldCheck className="w-3 h-3 text-amber-500" />
        <span>Propriétaire Vérifié</span>
      </div>
    )
  }

  if (type === 'photos') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-linear-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold shadow-sm ${className}`}>
        <Camera className="w-3 h-3 text-blue-500" />
        <span>Photos Certifiées</span>
      </div>
    )
  }

  if (type === 'availability') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-bold ${className}`}>
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span>Dispo Confirmée</span>
      </div>
    )
  }

  return null
}
