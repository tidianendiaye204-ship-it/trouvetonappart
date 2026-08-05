import { SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { searchBiensPubliques } from '@/lib/services/bien.service'
import RechercheClient from '@/components/RechercheClient'

type Recherche = {
    type?: string
    transaction?: string
    ville?: string
    prix_min?: string
    prix_max?: string
    tri?: string
}

const TRI_LABELS: Record<string, string> = {
    recent: 'Plus récent',
    prix_asc: 'Prix croissant',
    prix_desc: 'Prix décroissant',
    superficie: 'Superficie',
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Recherche> }): Promise<import('next').Metadata> {
    const { type, transaction, ville } = await searchParams
    
    const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Biens immobiliers'
    const transacLabel = transaction === 'location' ? 'à louer' : transaction === 'vente' ? 'à vendre' : 'à louer ou à vendre'
    const villeLabel = ville ? ` à ${ville}` : ' au Sénégal'
    
    const title = `${typeLabel} ${transacLabel}${villeLabel} | TrouveTonAppart`
    const description = `Parcourez nos annonces de ${type || 'biens'} ${transacLabel}${villeLabel}. Trouvez le bien idéal au meilleur prix sur TrouveTonAppartement.sn.`
    
    return {
        title,
        description,
        alternates: {
            canonical: '/recherche',
        }
    }
}

export default async function RecherchePage({
    searchParams,
}: {
    searchParams: Promise<Recherche>
}) {
    const { type, transaction, ville, prix_min, prix_max, tri } = await searchParams

    const biensAffiches = await searchBiensPubliques({ type, transaction, ville, prix_min, prix_max, tri })

    // Affichage du résumé des filtres actifs
    const filtresActifs = [
        type && `Type : ${type}`,
        transaction && (transaction === 'location' ? 'À Louer' : 'À Vendre'),
        ville && `Ville : ${ville}`,
        prix_min && `Min : ${Number(prix_min).toLocaleString('fr-FR')} FCFA`,
        prix_max && `Max : ${Number(prix_max).toLocaleString('fr-FR')} FCFA`,
        tri && tri !== 'recent' ? `Tri : ${TRI_LABELS[tri] ?? tri}` : undefined,
    ].filter((f): f is string => typeof f === 'string')

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] mt-20 bg-sable-fond">
            {/* ── Barre de filtres (Server Component, form GET natif) ── */}
            <div className="shrink-0 px-4 pt-4 pb-0 border-b border-ardoise-gris/10 bg-sable-fond">
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

                    {/* Ligne 2 : budget + tri */}
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

                        <div className="w-px h-5 bg-ardoise-gris/20 shrink-0 mx-1" />

                        {/* Tri */}
                        <ArrowUpDown className="w-4 h-4 text-indigo-principal shrink-0" />
                        <select
                            name="tri"
                            defaultValue={tri ?? 'recent'}
                            className="bg-transparent text-xs font-bold text-quasi-noir outline-none cursor-pointer hover:text-indigo-principal transition-colors"
                        >
                            <option value="recent">Plus récent</option>
                            <option value="prix_asc">Prix ↑</option>
                            <option value="prix_desc">Prix ↓</option>
                            <option value="superficie">Superficie</option>
                        </select>

                        {filtresActifs.length > 0 && (
                            <a
                                href="/recherche"
                                className="shrink-0 text-xs text-ardoise-gris hover:text-red-500 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                title="Effacer tous les filtres"
                            >
                                ✕ Effacer
                            </a>
                        )}
                    </div>

                    {/* Tags filtres actifs */}
                    {filtresActifs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-2">
                            {filtresActifs.map((f) => (
                                <span key={f} className="bg-indigo-principal/10 text-indigo-principal text-xs font-bold px-3 py-1 rounded-full border border-indigo-principal/20">
                                    {f}
                                </span>
                            ))}
                        </div>
                    )}
                </form>
            </div>

            {/* ── Zone liste + carte (Client Component pour hover sync) ── */}
            <RechercheClient biens={biensAffiches} />
        </div>
    )
}
