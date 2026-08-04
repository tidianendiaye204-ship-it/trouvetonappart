import Link from 'next/link'
import { Building2, Mail, Phone, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-ardoise-gris/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
        <div className="md:col-span-5 lg:col-span-4">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="bg-indigo-principal text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-quasi-noir">TrouveTonAppart</span>
          </Link>
          <p className="text-ardoise-gris text-base max-w-sm leading-relaxed mb-8">
            La plateforme de référence au Sénégal pour trouver votre futur logement et pour les professionnels souhaitant gérer leurs biens immobiliers en toute simplicité.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="text-indigo-principal font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Rejoindre en tant que pro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
          <h3 className="font-display font-bold text-quasi-noir text-lg mb-6 tracking-tight">Navigation</h3>
          <ul className="space-y-4 text-base font-medium text-ardoise-gris">
            <li><Link href="/recherche" className="hover:text-indigo-principal transition-colors">Rechercher un bien</Link></li>
            <li><Link href="/#fonctionnalites" className="hover:text-indigo-principal transition-colors">Fonctionnalités</Link></li>
            <li><Link href="/#comment-ca-marche" className="hover:text-indigo-principal transition-colors">Comment ça marche</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4 lg:col-span-3 lg:col-start-10">
          <h3 className="font-display font-bold text-quasi-noir text-lg mb-6 tracking-tight">Contactez-nous</h3>
          <ul className="space-y-4 text-base font-medium text-ardoise-gris">
            <li>
              <a href="mailto:yacoubatoure4@gmail.com" className="flex items-center gap-3 hover:text-indigo-principal transition-colors">
                <div className="w-8 h-8 rounded-full bg-sable-fond flex items-center justify-center"><Mail className="h-4 w-4" /></div>
                yacoubatoure4@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+221785161862" className="flex items-center gap-3 hover:text-indigo-principal transition-colors">
                <div className="w-8 h-8 rounded-full bg-sable-fond flex items-center justify-center"><Phone className="h-4 w-4" /></div>
                +221 78 516 18 62
              </a>
            </li>
            <li>
              <a href="tel:+221770362616" className="flex items-center gap-3 hover:text-indigo-principal transition-colors">
                <div className="w-8 h-8 rounded-full bg-sable-fond flex items-center justify-center"><Phone className="h-4 w-4" /></div>
                +221 77 036 26 16
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-ardoise-gris/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm font-medium text-ardoise-gris/70">
          &copy; {new Date().getFullYear()} TrouveTonAppartement. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
