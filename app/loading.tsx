import { Building2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 flex items-center justify-center mb-8">
        <div className="absolute inset-0 border-4 border-indigo-principal/20 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-2 border-4 border-indigo-principal/40 rounded-full animate-pulse"></div>
        <Building2 className="w-10 h-10 text-indigo-principal relative z-10 animate-bounce" />
      </div>
      
      <h2 className="font-display font-bold text-2xl text-quasi-noir mb-2">Chargement en cours...</h2>
      <p className="text-ardoise-gris font-medium animate-pulse">Préparation de votre espace TrouveTonAppart</p>
    </div>
  )
}
