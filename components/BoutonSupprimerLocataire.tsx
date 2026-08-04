'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supprimerLocataire } from '@/app/actions/supprimerLocataire'

export default function BoutonSupprimerLocataire({ id }: { id: string }) {
    const [enCours, setEnCours] = useState(false)

    async function handleSupprimer() {
        if (confirm("Voulez-vous vraiment supprimer ce locataire ? Cette action est irréversible.")) {
            setEnCours(true)
            try {
                const result = await supprimerLocataire(id)
                if (result?.error) {
                    alert(result.error)
                }
            } catch (error) {
                alert("Erreur lors de la suppression.")
            } finally {
                setEnCours(false)
            }
        }
    }

    return (
        <button
            onClick={handleSupprimer}
            disabled={enCours}
            className="flex items-center justify-center p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer le locataire"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}
