'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import ModalAlerte from './ModalAlerte'

export default function BoutonAlerte() {
  const [showModal, setShowModal] = useState(false)
  const searchParams = useSearchParams()

  const type = searchParams.get('type') || undefined
  const transaction = searchParams.get('transaction') || undefined
  const ville = searchParams.get('ville') || undefined
  const prix_max = searchParams.get('prix_max') || undefined

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-white border border-indigo-principal/30 text-indigo-principal px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all active:scale-95 shrink-0"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:inline">Créer une alerte</span>
        <span className="sm:hidden">Alerte</span>
      </button>

      {showModal && (
        <ModalAlerte
          type={type}
          transaction={transaction}
          ville={ville}
          prix_max={prix_max}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
