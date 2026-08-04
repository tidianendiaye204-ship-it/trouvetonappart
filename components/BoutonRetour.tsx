'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BoutonRetour({ className = '' }: { className?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 text-sm font-medium text-ardoise-gris hover:text-quasi-noir transition-colors mb-6 group ${className}`}
    >
      <div className="p-2 bg-white rounded-full border border-ardoise-gris/10 shadow-sm group-hover:border-ardoise-gris/30 transition-all">
        <ArrowLeft className="w-4 h-4" />
      </div>
      Retour
    </button>
  )
}
