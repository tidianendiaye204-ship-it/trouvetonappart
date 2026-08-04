import Link from 'next/link'
import Image from 'next/image'
import { Map, MessageSquare, Filter, TrendingUp, UserCircle, MapPin, MessageCircle, UploadCloud, LayoutDashboard, FileText, CheckCircle2, Star, Search, ArrowRight, Home } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="flex flex-col bg-white">
            {/* 1. Hero Section avec fausse barre de recherche */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-principal/5 to-safran-accent/10 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay z-0"></div>
                
                {/* Éléments décoratifs flottants */}
                <div className="hidden lg:block absolute top-1/4 left-10 animate-bounce delay-100 bg-white p-3 rounded-2xl shadow-xl border border-ardoise-gris/10 z-0 rotate-[-10deg]">
                    <div className="text-sm font-bold text-indigo-principal">À Vendre</div>
                    <div className="text-quasi-noir font-black text-xl">35M FCFA</div>
                </div>
                <div className="hidden lg:block absolute bottom-1/4 right-10 animate-bounce delay-300 bg-white p-3 rounded-2xl shadow-xl border border-ardoise-gris/10 z-0 rotate-[5deg]">
                    <div className="text-sm font-bold text-safran-accent">À Louer</div>
                    <div className="text-quasi-noir font-black text-xl">450k /mois</div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-quasi-noir mb-6 leading-[1.1]">
                        L'immobilier au Sénégal, <br/>
                        <span className="text-indigo-principal">sans prise de tête.</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-ardoise-gris mb-10 max-w-2xl mx-auto leading-relaxed">
                        Trouvez l'appartement idéal sans intermédiaires cachés. Gérez vos biens locatifs facilement. La plateforme n°1 de confiance.
                    </p>

                    {/* Fausse barre de recherche interactive */}
                    <div className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-2xl border border-ardoise-gris/10 flex flex-col sm:flex-row items-center gap-2 hover:shadow-indigo-principal/20 transition-shadow duration-500">
                        <Link href="/recherche" className="flex-1 w-full sm:w-auto px-6 py-4 flex flex-col items-start hover:bg-sable-fond rounded-full transition-colors cursor-pointer text-left group">
                            <span className="text-xs font-bold uppercase tracking-wider text-quasi-noir group-hover:text-indigo-principal">Localisation</span>
                            <span className="text-ardoise-gris/60 text-sm">Où cherchez-vous ?</span>
                        </Link>
                        <div className="hidden sm:block w-px h-10 bg-ardoise-gris/20"></div>
                        <Link href="/recherche" className="flex-1 w-full sm:w-auto px-6 py-4 flex flex-col items-start hover:bg-sable-fond rounded-full transition-colors cursor-pointer text-left group">
                            <span className="text-xs font-bold uppercase tracking-wider text-quasi-noir group-hover:text-indigo-principal">Projet</span>
                            <span className="text-ardoise-gris/60 text-sm">Louer ou acheter ?</span>
                        </Link>
                        <Link href="/recherche" className="w-full sm:w-auto bg-indigo-principal text-white px-8 py-4 sm:py-5 rounded-full font-bold shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 sm:mt-0">
                            <Search className="w-5 h-5" />
                            <span>Rechercher</span>
                        </Link>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-6 text-sm font-medium text-ardoise-gris">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-safran-accent" /> Zéro frais cachés</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-safran-accent" /> Contact direct</div>
                    </div>
                </div>
            </section>

            {/* 2. Fonctionnalités (Design Alterné) */}
            <section id="fonctionnalites" className="py-24 bg-white px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold text-indigo-principal tracking-widest uppercase mb-3">Fonctionnalités</h2>
                        <h3 className="font-display text-4xl font-black text-quasi-noir mb-4">Tout ce dont vous avez besoin</h3>
                        <p className="text-lg text-ardoise-gris max-w-2xl mx-auto">Des outils pensés pour fluidifier le marché immobilier sénégalais.</p>
                    </div>

                    {/* Feature 1 : Pour les locataires */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                        <div className="flex-1 order-2 lg:order-1 space-y-6">
                            <div className="w-14 h-14 bg-sable-fond rounded-2xl flex items-center justify-center border border-ardoise-gris/10 shadow-sm mb-6">
                                <MapPin className="w-7 h-7 text-indigo-principal" />
                            </div>
                            <h4 className="font-display text-3xl font-bold text-quasi-noir">Recherche sur carte interactive</h4>
                            <p className="text-lg text-ardoise-gris leading-relaxed">
                                Visualisez exactement où se trouve votre futur logement. Filtrez par prix, nombre de pièces et type de transaction pour trouver la perle rare à Dakar ou en région.
                            </p>
                            <ul className="space-y-3 pt-4">
                                <li className="flex items-center gap-3 text-quasi-noir font-medium"><CheckCircle2 className="w-5 h-5 text-emeraude" /> Carte précise et rapide</li>
                                <li className="flex items-center gap-3 text-quasi-noir font-medium"><CheckCircle2 className="w-5 h-5 text-emeraude" /> Filtres avancés</li>
                                <li className="flex items-center gap-3 text-quasi-noir font-medium"><CheckCircle2 className="w-5 h-5 text-emeraude" /> Sauvegarde de favoris</li>
                            </ul>
                        </div>
                        <div className="flex-1 order-1 lg:order-2 w-full">
                            <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-sable-fond rounded-3xl overflow-hidden shadow-2xl border border-ardoise-gris/10">
                                {/* Faux UI pour illustrer la carte */}
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-full shadow-xl font-bold text-indigo-principal flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Dakar, Almadies
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 : Pour les propriétaires */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 w-full">
                            <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-indigo-principal/5 rounded-3xl overflow-hidden shadow-xl border border-ardoise-gris/10 flex items-center justify-center p-8">
                                {/* Faux UI pour illustrer le dashboard */}
                                <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-ardoise-gris/10 overflow-hidden">
                                    <div className="bg-sable-fond border-b border-ardoise-gris/10 p-4 font-bold text-quasi-noir text-sm flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-indigo-principal" /> Tableau de bord Pro
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex justify-between items-center border-b border-ardoise-gris/10 pb-2">
                                            <span className="text-xs text-ardoise-gris font-bold uppercase">Revenus ce mois</span>
                                            <span className="font-bold text-indigo-principal">850 000 FCFA</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-safran-accent/20 flex items-center justify-center text-safran-accent"><UserCircle className="w-4 h-4" /></div>
                                            <div className="flex-1">
                                                <div className="h-2 w-full bg-sable-fond rounded-full overflow-hidden"><div className="h-full bg-safran-accent w-3/4"></div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="w-14 h-14 bg-indigo-principal/10 rounded-2xl flex items-center justify-center border border-indigo-principal/20 shadow-sm mb-6">
                                <LayoutDashboard className="w-7 h-7 text-indigo-principal" />
                            </div>
                            <h4 className="font-display text-3xl font-bold text-quasi-noir">Gestion locative simplifiée</h4>
                            <p className="text-lg text-ardoise-gris leading-relaxed">
                                Finis les carnets et les fichiers Excel. Enregistrez vos locataires, suivez les paiements de loyer et générez des quittances professionnelles en un seul clic.
                            </p>
                            <ul className="space-y-3 pt-4">
                                <li className="flex items-center gap-3 text-quasi-noir font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-principal" /> Suivi des baux et locataires</li>
                                <li className="flex items-center gap-3 text-quasi-noir font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-principal" /> Quittances automatiques</li>
                                <li className="flex items-center gap-3 text-quasi-noir font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-principal" /> Vue financière centralisée</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Comment ça marche (Timeline Visuelle) */}
            <section id="comment-ca-marche" className="py-24 bg-quasi-noir px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold text-safran-accent tracking-widest uppercase mb-3">Simplicité</h2>
                        <h3 className="font-display text-4xl font-black text-white mb-4">Comment ça marche ?</h3>
                    </div>

                    <div className="relative">
                        {/* Ligne connectrice */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-linear-to-r from-quasi-noir via-ardoise-gris/30 to-quasi-noir z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {/* Étape 1 */}
                            <div className="text-center flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-quasi-noir border-4 border-ardoise-gris/30 flex items-center justify-center mb-6 shadow-xl relative group">
                                    <div className="absolute inset-0 rounded-full bg-safran-accent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    <Search className="w-10 h-10 text-white" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-safran-accent text-quasi-noir font-black flex items-center justify-center text-sm shadow-md">1</div>
                                </div>
                                <h4 className="font-display text-2xl font-bold text-white mb-3">Recherchez</h4>
                                <p className="text-ardoise-gris leading-relaxed">Trouvez le bien idéal sur notre carte interactive parmi des centaines d'annonces vérifiées.</p>
                            </div>

                            {/* Étape 2 */}
                            <div className="text-center flex flex-col items-center mt-0 md:mt-12">
                                <div className="w-24 h-24 rounded-full bg-quasi-noir border-4 border-ardoise-gris/30 flex items-center justify-center mb-6 shadow-xl relative group">
                                    <div className="absolute inset-0 rounded-full bg-indigo-principal opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                    <MessageSquare className="w-10 h-10 text-white" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-principal text-white font-black flex items-center justify-center text-sm shadow-md">2</div>
                                </div>
                                <h4 className="font-display text-2xl font-bold text-white mb-3">Contactez</h4>
                                <p className="text-ardoise-gris leading-relaxed">Envoyez une demande directement au propriétaire sans payer d'intermédiaire.</p>
                            </div>

                            {/* Étape 3 */}
                            <div className="text-center flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-quasi-noir border-4 border-ardoise-gris/30 flex items-center justify-center mb-6 shadow-xl relative group">
                                    <div className="absolute inset-0 rounded-full bg-emeraude opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    <Home className="w-10 h-10 text-white" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emeraude text-quasi-noir font-black flex items-center justify-center text-sm shadow-md">3</div>
                                </div>
                                <h4 className="font-display text-2xl font-bold text-white mb-3">Emménagez</h4>
                                <p className="text-ardoise-gris leading-relaxed">Signez le bail, payez votre loyer et recevez vos quittances en ligne via notre plateforme.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Histoire du projet & Fondateurs */}
            <section id="equipe" className="py-24 bg-sable-fond px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-black text-quasi-noir mb-6">Derrière le projet</h2>
                        <p className="text-xl text-ardoise-gris max-w-3xl mx-auto leading-relaxed font-medium">
                            "En tant qu'étudiant à l'UCAD, j'ai vécu les galères de la recherche de logement. Nous avons créé cette plateforme pour apporter une solution moderne et transparente."
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8">
                        {/* Yacouba */}
                        <div className="bg-white border border-ardoise-gris/10 p-8 rounded-3xl shadow-sm text-center w-full sm:w-1/2 max-w-sm hover:shadow-lg transition-shadow">
                            <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-sable-fond shadow-md">
                                <Image src="/yacouba.jpg" alt="Yacouba Touré" fill className="object-cover" />
                            </div>
                            <h3 className="font-display font-black text-quasi-noir text-2xl mb-1">Yacouba Touré</h3>
                            <p className="text-indigo-principal mb-6 font-bold text-sm uppercase tracking-wider">Fondateur</p>
                            
                            <div className="flex flex-col gap-3 text-sm font-medium mt-auto">
                                <a href="mailto:yacoubatoure4@gmail.com" className="text-ardoise-gris hover:text-indigo-principal transition-colors bg-sable-fond py-2 px-4 rounded-full">
                                    yacoubatoure4@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Maboul */}
                        <div className="bg-white border border-ardoise-gris/10 p-8 rounded-3xl shadow-sm text-center w-full sm:w-1/2 max-w-sm hover:shadow-lg transition-shadow">
                            <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-sable-fond shadow-md">
                                <Image src="/maboul.jpg" alt="Maboul" fill className="object-cover" />
                            </div>
                            <h3 className="font-display font-black text-quasi-noir text-2xl mb-1">Maboul</h3>
                            <p className="text-indigo-principal mb-6 font-bold text-sm uppercase tracking-wider">Développeur</p>
                            
                            <div className="flex flex-col gap-3 text-sm font-medium mt-auto">
                                <div className="text-ardoise-gris bg-sable-fond py-2 px-4 rounded-full">
                                    Lead Tech & Architecte
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Call To Action Final */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-5xl mx-auto bg-indigo-principal rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-safran-accent opacity-20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                    
                    <div className="relative z-10">
                        <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6">Prêt à changer d'air ?</h2>
                        <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                            Que vous cherchiez votre prochain chez-vous ou que vous souhaitiez gérer vos biens professionnels, rejoignez TrouveTonAppart aujourd'hui.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/recherche" className="bg-white text-indigo-principal px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                Je cherche un bien <Search className="w-5 h-5" />
                            </Link>
                            <Link href="/login" className="bg-indigo-900 text-white border border-indigo-700 px-8 py-4 rounded-full text-lg font-bold shadow-sm hover:bg-indigo-800 transition-colors flex items-center justify-center gap-2">
                                Espace Propriétaire <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}