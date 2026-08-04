'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import ChampAdresse from './ChampAdresse'

type TypeBien = 'terrain' | 'maison' | 'appartement'
type Transaction = 'location' | 'vente'
type Statut = 'disponible' | 'reserve' | 'loue' | 'vendu'

export default function FormulaireBien({ bien }: { bien?: any }) {
    const router = useRouter()
    const supabase = createClient()
    const isEditMode = !!bien

    const [titre, setTitre] = useState(bien?.titre || '')
    const [type, setType] = useState<TypeBien>(bien?.type || 'maison')
    const [transaction, setTransaction] = useState<Transaction>(bien?.transaction || 'location')
    const [statut, setStatut] = useState<Statut>(bien?.statut || 'disponible')
    const [publie, setPublie] = useState(bien?.publie ?? true)
    const [description, setDescription] = useState(bien?.description || '')
    const [prix, setPrix] = useState(bien?.prix?.toString() || '')
    const [superficie, setSuperficie] = useState(bien?.superficie?.toString() || '')
    const [nbChambres, setNbChambres] = useState(bien?.nb_chambres?.toString() || '')
    const [adresse, setAdresse] = useState<{
        adresse: string
        ville: string | null
        quartier: string | null
        latitude: number
        longitude: number
    } | null>(bien ? {
        adresse: bien.adresse,
        ville: bien.ville,
        quartier: bien.quartier,
        latitude: bien.latitude,
        longitude: bien.longitude
    } : null)
    
    // Pour l'édition, on garde les anciennes images affichées et on permet d'en rajouter des nouvelles.
    const [anciennesImages, setAnciennesImages] = useState<any[]>(bien?.biens_images || [])
    const [images, setImages] = useState<File[]>([])
    
    const [enCours, setEnCours] = useState(false)
    const [erreur, setErreur] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErreur(null)

        if (!adresse) {
            setErreur("Veuillez sélectionner une adresse dans la liste proposée.")
            return
        }

        setEnCours(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setErreur('Vous devez être connecté.')
                return
            }

            let bienId = bien?.id

            if (isEditMode) {
                const { error: erreurBien } = await supabase
                    .from('biens')
                    .update({
                        titre,
                        type,
                        transaction,
                        statut,
                        publie,
                        description,
                        adresse: adresse.adresse,
                        ville: adresse.ville,
                        quartier: adresse.quartier,
                        latitude: adresse.latitude,
                        longitude: adresse.longitude,
                        prix: Number(prix),
                        superficie: superficie ? Number(superficie) : null,
                        nb_chambres: nbChambres ? Number(nbChambres) : null,
                    })
                    .eq('id', bienId)

                if (erreurBien) throw erreurBien
            } else {
                const { data: newBien, error: erreurBien } = await supabase
                    .from('biens')
                    .insert({
                        proprietaire_id: user.id,
                        titre,
                        type,
                        transaction,
                        statut,
                        publie,
                        description,
                        adresse: adresse.adresse,
                        ville: adresse.ville,
                        quartier: adresse.quartier,
                        latitude: adresse.latitude,
                        longitude: adresse.longitude,
                        prix: Number(prix),
                        superficie: superficie ? Number(superficie) : null,
                        nb_chambres: nbChambres ? Number(nbChambres) : null,
                    })
                    .select()
                    .single()

                if (erreurBien) throw erreurBien
                bienId = newBien.id
            }

            // Uploader les images (nouvelles)
            if (images.length > 0) {
                const lastOrdre = anciennesImages.length > 0 
                    ? Math.max(...anciennesImages.map(img => img.ordre)) 
                    : -1;

                const optionsCompression = {
                    maxSizeMB: 0.4, // Limite à environ 400 Ko par image
                    maxWidthOrHeight: 1600, // Limite la résolution maximale
                    useWebWorker: true,
                    fileType: 'image/webp' // Convertit automatiquement en WebP pour gagner en taille
                };

                for (let i = 0; i < images.length; i++) {
                    const fichierOriginal = images[i]
                    let fichier = fichierOriginal;
                    
                    try {
                        fichier = await imageCompression(fichierOriginal, optionsCompression);
                    } catch (error) {
                        console.error('Erreur lors de la compression', error);
                        // On continue avec l'original si la compression échoue
                    }
                    
                    // On modifie l'extension si on force le webp
                    const extension = optionsCompression.fileType === 'image/webp' ? '.webp' : '';
                    const nomFichier = fichier.name.replace(/\.[^/.]+$/, "") + extension;
                    const chemin = `${bienId}/${Date.now()}-${nomFichier}`

                    const { error: erreurUpload } = await supabase.storage
                        .from('biens-images')
                        .upload(chemin, fichier)

                    if (erreurUpload) throw erreurUpload

                    const { data: { publicUrl } } = supabase.storage.from('biens-images').getPublicUrl(chemin)

                    await supabase.from('biens_images').insert({
                        bien_id: bienId,
                        url: publicUrl,
                        ordre: lastOrdre + 1 + i,
                    })
                }
            }

            router.push(`/mes-annonces`)
            router.refresh()
        } catch (err) {
            setErreur(err instanceof Error ? err.message : 'Une erreur est survenue.')
        } finally {
            setEnCours(false)
        }
    }

    async function handleDeleteAncienneImage(imageId: string, e: React.MouseEvent) {
        e.preventDefault()
        if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
            setEnCours(true)
            try {
                await supabase.from('biens_images').delete().eq('id', imageId)
                setAnciennesImages(prev => prev.filter(img => img.id !== imageId))
            } catch (err) {
                console.error(err)
            } finally {
                setEnCours(false)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            {isEditMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-sable-fond/50 p-4 rounded-xl border border-ardoise-gris/10">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Statut</label>
                        <select
                            value={statut}
                            onChange={(e) => setStatut(e.target.value as Statut)}
                            className="w-full px-4 py-2 border border-ardoise-gris/30 bg-white rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir"
                        >
                            <option value="disponible">Disponible</option>
                            <option value="reserve">Réservé</option>
                            <option value="loue">Loué</option>
                            <option value="vendu">Vendu</option>
                        </select>
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={publie}
                                onChange={(e) => setPublie(e.target.checked)}
                                className="w-5 h-5 text-indigo-principal rounded border-ardoise-gris/30 focus:ring-indigo-principal"
                            />
                            <span className="text-sm font-medium text-quasi-noir">Annonce publiée (visible)</span>
                        </label>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Titre de l'annonce</label>
                <input
                    required
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all placeholder:text-ardoise-gris/50"
                    placeholder="Ex: Belle villa 4 pièces à Sacré-Cœur"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as TypeBien)}
                        className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all"
                    >
                        <option value="maison">Maison</option>
                        <option value="appartement">Appartement</option>
                        <option value="terrain">Terrain</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Transaction</label>
                    <select
                        value={transaction}
                        onChange={(e) => setTransaction(e.target.value as Transaction)}
                        className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all"
                    >
                        <option value="location">Location</option>
                        <option value="vente">Vente</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Adresse {isEditMode && '(tapez pour modifier)'}</label>
                {isEditMode && <div className="mb-2 text-sm text-ardoise-gris">Adresse actuelle : {bien.adresse}</div>}
                <ChampAdresse onSelect={setAdresse} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Prix (FCFA)</label>
                    <input
                        required
                        type="number"
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                        className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Superficie (m²)</label>
                    <input
                        type="number"
                        value={superficie}
                        onChange={(e) => setSuperficie(e.target.value)}
                        className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all"
                    />
                </div>
                {type !== 'terrain' && (
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Chambres</label>
                        <input
                            type="number"
                            value={nbChambres}
                            onChange={(e) => setNbChambres(e.target.value)}
                            className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all"
                        />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5 text-quasi-noir">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-ardoise-gris/30 bg-sable-fond rounded-xl focus:ring-2 focus:ring-indigo-principal outline-none text-quasi-noir transition-all"
                />
            </div>

            <div className="pt-2">
                {isEditMode && anciennesImages.length > 0 && (
                    <>
                        <label className="block text-sm font-medium mb-3 text-quasi-noir">Photos actuelles</label>
                        <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                            {anciennesImages.map((img: any) => (
                                <div key={img.id} className="relative shrink-0 w-24 h-24">
                                    <Image src={img.url} alt="Photo du bien" fill className="object-cover rounded-xl" />
                                    <button onClick={(e) => handleDeleteAncienneImage(img.id, e)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs hover:bg-red-600 shadow-sm">&times;</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {isEditMode && anciennesImages.length === 0 && (
                    <p className="text-sm text-ardoise-gris mb-4">Aucune photo actuelle.</p>
                )}

                <label className="block text-sm font-medium mb-3 text-quasi-noir">
                    {isEditMode ? 'Ajouter de nouvelles photos' : 'Photos du bien'}
                </label>
                <div className="relative border-2 border-dashed border-ardoise-gris/30 rounded-2xl p-8 hover:border-indigo-principal hover:bg-indigo-principal/5 transition-colors group cursor-pointer flex flex-col items-center justify-center text-center">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setImages(Array.from(e.target.files ?? []))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-16 h-16 bg-indigo-principal/10 text-indigo-principal rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <p className="text-quasi-noir font-medium mb-1 group-hover:text-indigo-principal transition-colors">Cliquez pour choisir des photos {isEditMode ? 'supplémentaires' : ''}</p>
                    <p className="text-sm text-ardoise-gris">ou glissez-les ici (PNG, JPG, max 5MB)</p>

                    {images.length > 0 && (
                        <div className="mt-6 w-full flex flex-wrap gap-2 justify-center border-t border-ardoise-gris/20 pt-6">
                            <span className="text-sm font-bold text-white bg-indigo-principal px-3 py-1 rounded-full">{images.length} {isEditMode ? 'nouvelle(s) photo(s)' : 'fichier(s) sélectionné(s)'}</span>
                        </div>
                    )}
                </div>
            </div>

            {erreur && <p className="text-red-500 font-medium text-sm">{erreur}</p>}

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={enCours}
                    className="rounded-full bg-indigo-principal text-white px-8 py-3 font-bold hover:brightness-110 transition-all active:scale-95 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {enCours ? (isEditMode ? 'Enregistrement...' : 'Publication en cours...') : (isEditMode ? 'Enregistrer les modifications' : "Publier l'annonce")}
                </button>
            </div>
        </form>
    )
}
