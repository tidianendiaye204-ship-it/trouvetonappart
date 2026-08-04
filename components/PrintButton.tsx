'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-indigo-principal text-white px-6 py-2.5 rounded-full font-bold hover:brightness-110 transition-all shadow-md"
    >
      <Printer className="w-4 h-4" />
      Imprimer
    </button>
  )
}
