import Link from 'next/link'
import { MapPin, Search, ArrowRight, ShieldCheck, Home, Banknote, Building2, ChevronRight, FileText, Sparkles, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="flex flex-col bg-sable-fond min-h-screen">
            
            {/* HERO SECTION - Asymétrique, impactant, ancrage local */}
            <section className="relative pt-24 lg:pt-32 pb-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-200 h-200 bg-indigo-principal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-150 h-150 bg-safran-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Colonne de gauche - Copywriting fort */}
                        <div className="lg:col-span-7 flex flex-col items-start">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-ardoise-gris/10 shadow-sm mb-8 animate-fade-in">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emeraude opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emeraude"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-quasi-noir">Dakar, Thiès, Saly & plus</span>
                            </div>
                            
                            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-quasi-noir leading-[1.05] mb-6">
                                L'immobilier <br/>
                                <span className="relative inline-block mt-2">
                                    <span className="relative z-10 text-indigo-principal">repensé</span>
                                    <span className="absolute bottom-2 left-0 w-full h-4 bg-safran-accent/30 -z-10 -rotate-2"></span>
                                </span> 
                                <span className="text-ardoise-gris/50"> pour le Sénégal.</span>
                            </h1>
                            
                            <p className="text-lg sm:text-xl text-ardoise-gris mb-10 max-w-lg leading-relaxed border-l-4 border-safran-accent pl-6">
                                Plus qu'un simple site d'annonces. Une plateforme complète pour trouver votre prochain toit sans intermédiaires cachés, ou gérer vos locations comme un professionnel.
                            </p>

                            {/* Double CTA - Séparation claire des parcours */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <Link href="/recherche" className="group relative inline-flex items-center justify-center px-8 py-4 bg-quasi-noir text-white font-bold rounded-2xl overflow-hidden transition-transform active:scale-95 shadow-xl shadow-quasi-noir/10">
                                    <div className="absolute inset-0 bg-indigo-principal translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                    <span className="relative flex items-center gap-2 z-10">
                                        <Search className="w-5 h-5" /> 
                                        Je cherche un bien
                                    </span>
                                </Link>
                                
                                <Link href="/login" className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-quasi-noir font-bold rounded-2xl border border-ardoise-gris/10 hover:border-safran-accent/50 transition-all active:scale-95 shadow-sm hover:shadow-md">
                                    <span className="flex items-center gap-2">
                                        Je gère mes biens <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Colonne de droite - Visuel destructuré */}
                        <div className="lg:col-span-5 relative hidden lg:block">
                            <div className="relative w-full aspect-4/5 rounded-4xl overflow-hidden shadow-2xl border-8 border-white bg-sable-fond transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center"></div>
                                {/* Overlay UI */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-indigo-principal uppercase">Appartement Keur Massar</span>
                                        <span className="text-emeraude font-black text-sm">À Louer</span>
                                    </div>
                                    <div className="text-xl font-black text-quasi-noir mb-1">90 000 FCFA <span className="text-xs text-ardoise-gris font-normal">/mois</span></div>
                                    <div className="flex items-center gap-1 text-ardoise-gris text-sm font-medium">
                                        <MapPin className="w-3 h-3" /> Rond-point Keur Massar
                                    </div>
                                </div>
                            </div>
                            {/* Élément flottant - Quittance */}
                            <div className="absolute -left-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-ardoise-gris/10 animate-bounce" style={{ animationDuration: '4s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-safran-accent/10 rounded-full flex items-center justify-center text-safran-accent-dark">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-ardoise-gris font-medium">Loyer Payé</div>
                                        <div className="text-sm font-black text-quasi-noir">Quittance générée</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* PREUVE SOCIALE - Bandeau minimaliste */}
            <div className="border-y border-ardoise-gris/10 bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <p className="text-sm font-bold uppercase tracking-widest text-ardoise-gris">Villes de lancement</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                        <span className="font-display font-black text-xl text-quasi-noir">KEUR MASSAR</span>
                        <span className="font-display font-black text-xl text-quasi-noir">KOUNOUNE</span>
                        <span className="font-display font-black text-xl text-quasi-noir">NDIOUM</span>
                        <span className="font-display font-black text-xl text-quasi-noir">DAKAR</span>
                        <span className="font-display font-black text-xl text-quasi-noir">SAINT-LOUIS</span>
                    </div>
                </div>
            </div>

            {/* PARCOURS 1 : CHERCHEURS (B2C) - Design Sticky Scroll */}
            <section className="py-24 relative bg-quasi-noir text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-principal/10 blur-[150px] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <span className="text-indigo-300 font-bold tracking-widest uppercase text-sm mb-2 block">Vous cherchez un bien ?</span>
                        <h2 className="font-display text-4xl md:text-5xl font-black max-w-2xl leading-tight">
                            Fini les visites inutiles et les frais d'agence exorbitants.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Carte 1 */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="w-14 h-14 bg-indigo-principal rounded-2xl flex items-center justify-center mb-6">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Recherche Carte</h3>
                            <p className="text-white/60 leading-relaxed">
                                Visualisez directement les biens sur une carte interactive du Sénégal. Ne perdez plus de temps à chercher l'adresse exacte.
                            </p>
                        </div>
                        {/* Carte 2 */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="w-14 h-14 bg-safran-accent rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-quasi-noir" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">0 Frais Cachés</h3>
                            <p className="text-white/60 leading-relaxed">
                                Traitez directement avec les propriétaires vérifiés ou des agences transparentes. Vous savez exactement ce que vous payez.
                            </p>
                        </div>
                        {/* Carte 3 */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="w-14 h-14 bg-emeraude rounded-2xl flex items-center justify-center mb-6">
                                <Building2 className="w-6 h-6 text-quasi-noir" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Signalement Actif</h3>
                            <p className="text-white/60 leading-relaxed">
                                Une annonce frauduleuse ou un bien déjà loué ? Notre système de signalement communautaire maintient le catalogue propre.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PARCOURS 2 : PROPRIÉTAIRES (B2B) - Design bento box */}
            <section className="py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-safran-accent-dark font-bold tracking-widest uppercase text-sm mb-2 block">Pour les Propriétaires & Agences</span>
                        <h2 className="font-display text-4xl md:text-5xl font-black text-quasi-noir leading-tight mb-6">
                            Gérez votre parc immobilier comme un expert.
                        </h2>
                        <p className="text-lg text-ardoise-gris">
                            De la création du contrat à l'encaissement du loyer, TrouveTonAppartement digitalise tout votre workflow locatif au Sénégal.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-75">
                        
                        {/* Grand bloc - Baux & Quittances */}
                        <div className="md:col-span-8 bg-sable-fond rounded-4xl p-10 relative overflow-hidden group">
                            <div className="relative z-10 w-full md:w-2/3">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-quasi-noir">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-black text-quasi-noir mb-4">Contrats & Quittances Automatiques</h3>
                                <p className="text-ardoise-gris text-lg leading-relaxed">
                                    Générez des contrats conformes à la législation sénégalaise en un clic. À chaque paiement, une quittance est envoyée automatiquement au locataire.
                                </p>
                            </div>
                            {/* Illustration */}
                            <div className="absolute right-[-10%] bottom-[-20%] w-2/3 opacity-30 md:opacity-100 transition-transform group-hover:-translate-y-4 duration-700">
                                <div className="bg-white p-6 rounded-2xl shadow-2xl border border-ardoise-gris/10 rotate-[-5deg]">
                                    <div className="h-4 w-32 bg-ardoise-gris/20 rounded mb-4"></div>
                                    <div className="h-3 w-48 bg-ardoise-gris/10 rounded mb-2"></div>
                                    <div className="h-3 w-40 bg-ardoise-gris/10 rounded mb-6"></div>
                                    <div className="flex justify-between items-end border-t border-ardoise-gris/10 pt-4 mt-8">
                                        <div className="h-8 w-24 bg-indigo-principal/20 rounded"></div>
                                        <div className="h-10 w-10 bg-safran-accent rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Petit Bloc - CRM */}
                        <div className="md:col-span-4 bg-indigo-principal text-white rounded-4xl p-10 flex flex-col justify-between group">
                            <div>
                                <Home className="w-8 h-8 text-indigo-300 mb-6" />
                                <h3 className="text-2xl font-bold mb-3">Suivi des Leads</h3>
                                <p className="text-indigo-100">
                                    Centralisez tous les messages de prospects intéressés par vos annonces sur un seul tableau de bord.
                                </p>
                            </div>
                            <Link href="/login" className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-3 transition-all mt-6">
                                Voir le dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Petit Bloc - Paiements en ligne */}
                        <div className="md:col-span-5 bg-white border border-ardoise-gris/20 rounded-4xl p-10 flex flex-col justify-between shadow-xl shadow-ardoise-gris/5">
                            <div>
                                <Banknote className="w-8 h-8 text-emeraude mb-6" />
                                <h3 className="text-2xl font-bold text-quasi-noir mb-3">Paiement Sécurisé</h3>
                                <p className="text-ardoise-gris">
                                    Permettez à vos locataires de payer leur loyer via lien sécurisé. Plus de retards, plus de déplacements.
                                </p>
                            </div>
                        </div>

                        {/* Grand bloc - Sponsorisation */}
                        <div className="md:col-span-7 bg-quasi-noir text-white rounded-4xl p-10 relative overflow-hidden flex items-center">
                            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-safran-accent/20 text-safran-accent rounded-full text-xs font-bold uppercase mb-6">
                                    <Sparkles className="w-3 h-3" /> Nouveau
                                </div>
                                <h3 className="text-3xl font-black mb-4">Boostez vos annonces</h3>
                                <p className="text-white/70 text-lg mb-6 max-w-md">
                                    Louez plus vite. Sponsorisez vos annonces pour apparaître en tête des résultats et multiplier vos contacts par 5.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* TARIFICATION - Transparence absolue */}
            <section className="py-24 bg-sable-fond border-t border-ardoise-gris/10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-black text-quasi-noir mb-4">Un modèle transparent.</h2>
                        <p className="text-lg text-ardoise-gris">Pas de frais d'inscription. Vous payez uniquement pour accélérer votre visibilité.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Plan Gratuit */}
                        <div className="bg-white rounded-4xl p-10 border border-ardoise-gris/20 shadow-sm relative">
                            <div className="text-sm font-bold text-ardoise-gris uppercase tracking-wider mb-2">Plan Standard</div>
                            <div className="flex items-end gap-2 mb-8">
                                <span className="text-5xl font-black text-quasi-noir">0 FCFA</span>
                                <span className="text-ardoise-gris pb-1">/ toujours</span>
                            </div>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-principal shrink-0 mt-0.5" /><span className="text-quasi-noir">Publication d'annonces illimitée</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-principal shrink-0 mt-0.5" /><span className="text-quasi-noir">Création de baux numériques</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-principal shrink-0 mt-0.5" /><span className="text-quasi-noir">Génération de quittances</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-principal shrink-0 mt-0.5" /><span className="text-quasi-noir">Messagerie intégrée</span></li>
                            </ul>
                            <Link href="/login" className="block w-full py-4 rounded-xl border-2 border-quasi-noir text-quasi-noir font-bold text-center hover:bg-quasi-noir hover:text-white transition-colors">
                                Créer un compte gratuit
                            </Link>
                        </div>

                        {/* Sponsorisation */}
                        <div className="bg-quasi-noir rounded-4xl p-10 border border-quasi-noir shadow-2xl relative overflow-hidden">
                            <div className="absolute top-6 right-6">
                                <span className="bg-safran-accent text-quasi-noir text-xs font-bold px-3 py-1 rounded-full uppercase">Optionnel</span>
                            </div>
                            <div className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2">Boost Annonce</div>
                            <div className="flex items-end gap-2 mb-8">
                                <span className="text-5xl font-black text-white">5 000 FCFA</span>
                                <span className="text-white/60 pb-1">/ annonce / semaine</span>
                            </div>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-safran-accent shrink-0 mt-0.5" /><span className="text-white">Annonce épinglée en haut de page</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-safran-accent shrink-0 mt-0.5" /><span className="text-white">Bandeau visuel distinctif</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-safran-accent shrink-0 mt-0.5" /><span className="text-white">Jusqu'à 5x plus de vues</span></li>
                                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-white/30 shrink-0 mt-0.5" /><span className="text-white/50">Renouvelable à la demande</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-display text-3xl font-black text-quasi-noir mb-12 text-center">Questions fréquentes</h2>
                    
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-lg font-bold text-quasi-noir mb-2">Est-ce vraiment gratuit pour les chercheurs de biens ?</h4>
                            <p className="text-ardoise-gris">Oui, 100% gratuit. Contrairement aux courtiers traditionnels, nous ne prenons aucune commission sur votre loyer ou votre achat. Vous traitez directement avec le propriétaire.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-quasi-noir mb-2">Comment les loyers sont-ils payés en ligne ?</h4>
                            <p className="text-ardoise-gris">Le propriétaire génère un lien de paiement sécurisé depuis son espace. Le locataire peut alors payer par carte bancaire. Les fonds sont transférés au propriétaire et la quittance est générée instantanément.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-quasi-noir mb-2">Que se passe-t-il si un bien est déjà loué ?</h4>
                            <p className="text-ardoise-gris">Les propriétaires peuvent mettre à jour le statut du bien en 1 clic. Si un propriétaire oublie, les utilisateurs peuvent signaler l'annonce, et notre équipe de modération la désactivera rapidement.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-principal"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
                    <h2 className="font-display text-4xl md:text-6xl font-black mb-8 leading-tight">
                        Prêt à changer d'ère ?
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/recherche" className="px-8 py-4 bg-white text-indigo-principal font-bold rounded-xl hover:scale-105 transition-transform shadow-xl">
                            Voir les biens disponibles
                        </Link>
                        <Link href="/login" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                            Créer mon espace pro
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    )
}