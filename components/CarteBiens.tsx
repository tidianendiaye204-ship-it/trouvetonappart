'use client'

import dynamic from 'next/dynamic'

const CarteBiens = dynamic(() => import('./CarteBiensMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />
})

export default CarteBiens
