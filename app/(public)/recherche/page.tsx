import CarteAnnonce from '@/components/CarteAnnonce'
import CarteBiens from '@/components/CarteBiens'
import { searchBiensPubliques } from '@/lib/services/bien.service'
import { SlidersHorizontal } from 'lucide-react'

type Recherche = {
    type?: string
    transaction?: string
    ville?: string
    prix_min?: string
    prix_max?: string
}

export default async function RecherchePage({
    searchParams,
}: {
    searchParams: Promise<Recherche>
}) {
    const { type, transaction, ville, prix_min, prix_max } = await searchParams

    const biensAffiches = await searchBiensPubliques({ type, transaction, ville, prix_min, prix_max })

    // Affichage du résumé des filtres actifs
    const filtresActifs = [
        type && `Type : ${type}`,
        transaction && (transaction === 'location' ? 'À Louer' : 'À Vendre'),
        ville && `Ville : ${ville}`,
        prix_min && `Min : ${Number(prix_min).toLocaleString('fr-FR')} FCFA`,
        prix_max && `Max : ${Number(prix_max).toLocaleString('fr-FR')} FCFA`,
    ].filter(Boolean)

    return (
        <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-5rem)] mt-20 bg-sable-fond">
            {/* ── Colonne liste + filtres ── */}
            <div className="w-full lg:w-1/2 overflow-y-auto border-t lg:border-t-0 lg:border-r border-ardoise-gris/20 h-[50vh] lg:h-full flex flex-col">

                {/* Formulaire de filtres */}
                <div className="p-4 pb-0 shrink-0">
                    <form className="flex flex-col gap-2" method="get">
                        {/* Ligne 1 : type / transaction / ville / rechercher */}
                        <div className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-md border border-ardoise-gris/10 p-1.5 gap-0">
                            <select
                                name="type"
                                defaultValue={type ?? ''}
                                className="flex-1 bg-transparent px-4 py-3 sm:py-2 font-medium outline-none text-quasi-noir border-b sm:border-b-0 sm:border-r border-ardoise-gris/20 hover:bg-sable-fond/50 transition-colors sm:rounded-l-xl cursor-pointer text-sm"
                            >
                                <option value="">Tous types</option>
                                <option value="maison">Maison</option>
                                <option value="appartement">Appartement</option>
                                <option value="terrain">Terrain</option>
                            </select>
                            <select
                                name="transaction"
                                defaultValue={transaction ?? ''}
                                className="flex-1 bg-transparent px-4 py-3 sm:py-2 font-medium outline-none text-quasi-noir border-b sm:border-b-0 sm:border-r border-ardoise-gris/20 hover:bg-sable-fond/50 transition-colors cursor-pointer text-sm"
                            >
                                <option value="">Location / Vente</option>
                                <option value="location">Location</option>
                                <option value="vente">Vente</option>
                            </select>
                            <input
                                name="ville"
                                defaultValue={ville ?? ''}
                                placeholder="Ville, quartier…"
                                className="flex-1 bg-transparent px-4 py-3 sm:py-2 font-medium outline-none text-quasi-noir placeholder-ardoise-gris/50 hover:bg-sable-fond/50 focus:bg-sable-fond/50 transition-colors text-sm border-b sm:border-b-0 sm:border-r border-ardoise-gris/20"
                            />
                            <button
                                type="submit"
                                className="mt-1.5 sm:mt-0 rounded-xl bg-indigo-principal text-white px-6 py-2.5 font-bold hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                <span className="sm:hidden">Rechercher</span>
                            </button>
                        </div>

                        {/* Ligne 2 : filtres de prix */}
                        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-ardoise-gris/10 px-3 py-2">
                            <SlidersHorizontal className="w-4 h-4 text-indigo-principal shrink-0" />
                            <span className="text-xs font-bold text-quasi-noir uppercase tracking-wide mr-1">Budget</span>
                            <div className="flex items-center gap-1.5 flex-1">
                                <input
                                    type="number"
                                    name="prix_min"
                                    defaultValue={prix_min ?? ''}
                                    placeholder="Min FCFA"
                                    min={0}
                                    step={10000}
                                    className="w-full bg-sable-fond border border-ardoise-gris/20 rounded-lg px-3 py-1.5 text-sm font-medium text-quasi-noir outline-none focus:ring-2 focus:ring-indigo-principal/30 placeholder:text-ardoise-gris/50 transition-all"
                                />
                                <span className="text-ardoise-gris/60 text-xs font-bold">–</span>
                                <input
                                    type="number"
                                    name="prix_max"
                                    defaultValue={prix_max ?? ''}
                                    placeholder="Max FCFA"
                                    min={0}
                                    step={10000}
                                    className="w-full bg-sable-fond border border-ardoise-gris/20 rounded-lg px-3 py-1.5 text-sm font-medium text-quasi-noir outline-none focus:ring-2 focus:ring-indigo-principal/30 placeholder:text-ardoise-gris/50 transition-all"
                                />
                            </div>
                            {/* Bouton reset filtres si filtres actifs */}
                            {filtresActifs.length > 0 && (
                                <a
                                    href="/recherche"
                                    className="shrink-0 text-xs text-ardoise-gris hover:text-rouge-danger font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Effacer tous les filtres"
                                >
                                    ✕ Tout effacer
                                </a>
                            )}
                        </div>

                        {/* Tags filtres actifs */}
                        {filtresActifs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {filtresActifs.map((f) => (
                                    <span key={f} className="bg-indigo-principal/10 text-indigo-principal text-xs font-bold px-3 py-1 rounded-full border border-indigo-principal/20">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                {/* Résultats */}
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="font-display text-2xl font-black text-quasi-noir">Trouvez votre pépite</h1>
                        <span className="text-sm font-medium text-ardoise-gris bg-ardoise-gris/10 px-3 py-1 rounded-full shrink-0">
                            {biensAffiches.length} résultat{biensAffiches.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {biensAffiches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-ardoise-gris/10 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B93A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </div>
                            <p className="font-bold text-quasi-noir mb-1">Aucun bien trouvé</p>
                            <p className="text-sm text-ardoise-gris max-w-xs">Essayez d&apos;élargir votre budget ou de modifier vos critères.</p>
                            <a href="/recherche" className="mt-4 text-sm font-bold text-indigo-principal hover:underline">Réinitialiser les filtres</a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                            {biensAffiches.map((bien) => (
                                <CarteAnnonce key={bien.id} bien={bien} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Colonne carte ── */}
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-full p-0">
                <CarteBiens biens={biensAffiches} />
            </div>
        </div>
    )
}
