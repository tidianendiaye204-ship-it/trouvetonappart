'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supprimerBail } from '@/app/actions/supprimerBail'
import { useRouter } from 'next/navigation'

export default function BoutonSupprimerBail({ id }: { id: string }) {
    const [enCours, setEnCours] = useState(false)
    const router = useRouter()

    async function handleSupprimer() {
        if (confirm("Voulez-vous vraiment supprimer ce contrat de location ? L'historique des paiements associé sera également supprimé. Cette action est irréversible.")) {
            setEnCours(true)
            try {
                const result = await supprimerBail(id)
                if (result?.error) {
                    alert(result.error)
                } else {
                    router.push('/baux')
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
            className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors disabled:opacity-50"
            title="Supprimer le contrat"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    )
}
