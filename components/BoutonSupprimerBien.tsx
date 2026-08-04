'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supprimerBien } from '@/app/actions/supprimerBien'

export default function BoutonSupprimerBien({ id }: { id: string }) {
    const [enCours, setEnCours] = useState(false)

    async function handleSupprimer() {
        if (confirm("Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible.")) {
            setEnCours(true)
            try {
                await supprimerBien(id)
            } catch (error) {
                alert("Erreur lors de la suppression.")
                setEnCours(false)
            }
        }
    }

    return (
        <button
            onClick={handleSupprimer}
            disabled={enCours}
            className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors disabled:opacity-50"
            title="Supprimer l'annonce"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    )
}
