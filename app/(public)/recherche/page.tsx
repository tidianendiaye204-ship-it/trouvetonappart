import { createClient } from '@/lib/supabase/server'
import CarteAnnonce from '@/components/CarteAnnonce'
import CarteBiens from '@/components/CarteBiens'
import { searchBiensPubliques } from '@/lib/services/bien.service'

type Recherche = {
    type?: string
    transaction?: string
    ville?: string
}

export default async function RecherchePage({
    searchParams,
}: {
    searchParams: Promise<Recherche>
}) {
    const { type, transaction, ville } = await searchParams

    const biensAffiches = await searchBiensPubliques({ type, transaction, ville })

    return (
        <div className="flex flex-col-reverse lg:flex-row h-screen pt-20 bg-sable-fond">
            {/* Colonne liste + filtres */}
            <div className="w-full lg:w-1/2 overflow-y-auto p-4 border-t lg:border-t-0 lg:border-r border-ardoise-gris/20 h-[50vh] lg:h-full">
                <form className="mb-8 flex flex-col sm:flex-row bg-white rounded-2xl sm:rounded-full shadow-md border border-ardoise-gris/10 p-1.5" method="get">
                    <select name="type" defaultValue={type ?? ''} className="flex-1 bg-transparent px-4 py-3 sm:py-2 font-medium outline-none text-quasi-noir border-b sm:border-b-0 sm:border-r border-ardoise-gris/20 hover:bg-sable-fond/50 transition-colors sm:rounded-l-full cursor-pointer">
                        <option value="">Tous types</option>
                        <option value="maison">Maison</option>
                        <option value="appartement">Appartement</option>
                        <option value="terrain">Terrain</option>
                    </select>
                    <select
                        name="transaction"
                        defaultValue={transaction ?? ''}
                        className="flex-1 bg-transparent px-4 py-3 sm:py-2 font-medium outline-none text-quasi-noir border-b sm:border-b-0 sm:border-r border-ardoise-gris/20 hover:bg-sable-fond/50 transition-colors cursor-pointer"
                    >
                        <option value="">Location / Vente</option>
                        <option value="location">Location</option>
                        <option value="vente">Vente</option>
                    </select>
                    <input
                        name="ville"
                        defaultValue={ville ?? ''}
                        placeholder="Où cherchez-vous ?"
                        className="flex-1 bg-transparent px-4 py-3 sm:py-2 font-medium outline-none text-quasi-noir placeholder-ardoise-gris/60 hover:bg-sable-fond/50 focus:bg-sable-fond/50 transition-colors"
                    />
                    <button type="submit" className="mt-2 sm:mt-0 rounded-xl sm:rounded-full bg-indigo-principal text-white px-8 py-3 sm:py-2 font-bold hover:brightness-110 transition-all active:scale-95 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2 sm:mr-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <span className="sm:hidden">Rechercher</span>
                    </button>
                </form>

                <h1 className="font-display text-3xl font-black text-quasi-noir mb-2">Trouvez votre pépite</h1>
                <p className="text-sm font-medium text-ardoise-gris mb-8 bg-ardoise-gris/10 inline-block px-3 py-1 rounded-full">{biensAffiches.length} annonce(s) trouvée(s)</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                    {biensAffiches.map((bien) => (
                        <CarteAnnonce key={bien.id} bien={bien} />
                    ))}
                </div>
            </div>

            {/* Colonne carte */}
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-full p-0">
                <CarteBiens biens={biensAffiches} />
            </div>
        </div>
    )
}
