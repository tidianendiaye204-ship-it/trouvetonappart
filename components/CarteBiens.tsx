'use client'

import dynamic from 'next/dynamic'
import { Bien } from '@/types'

const CarteBiensMap = dynamic(() => import('./CarteBiensMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />
})

export default function CarteBiens({ biens, hoveredBienId }: { biens: Bien[], hoveredBienId?: string | null }) {
    return <CarteBiensMap biens={biens} hoveredBienId={hoveredBienId} />
}
