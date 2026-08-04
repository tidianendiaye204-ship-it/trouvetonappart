import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, PlusCircle, ArrowLeft, Mail, Phone } from 'lucide-react'

export default async function LocatairesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: locataires } = await supabase
    .from('locataires')
    .select('*')
    .eq('proprietaire_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/mes-annonces" className="text-ardoise-gris hover:text-quasi-noir flex items-center gap-2 text-sm font-medium w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-quasi-noir">Mes Locataires</h1>
          <p className="text-ardoise-gris mt-1">Gérez votre répertoire de contacts locataires.</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/locataires/nouveau"
            className="flex items-center gap-2 rounded-full bg-indigo-principal text-white px-6 py-2.5 font-bold shadow-md hover:brightness-110 transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            Nouveau Locataire
          </Link>
        </div>
      </div>

      {!locataires || locataires.length === 0 ? (
        <div className="text-center py-20 bg-sable-fond/50 rounded-3xl border border-dashed border-ardoise-gris/30">
          <div className="w-16 h-16 bg-white text-ardoise-gris rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-quasi-noir mb-2">Aucun locataire enregistré</h3>
          <p className="text-ardoise-gris mb-6 max-w-md mx-auto">
            Ajoutez votre premier locataire pour commencer à suivre vos contrats de location et vos paiements de loyer.
          </p>
          <Link href="/locataires/nouveau" className="inline-flex items-center gap-2 rounded-full bg-indigo-principal text-white px-6 py-2.5 font-bold shadow-md hover:brightness-110 transition-all">
            <PlusCircle className="w-5 h-5" />
            Ajouter un locataire
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-ardoise-gris">
            <thead className="bg-sable-fond border-b border-ardoise-gris/10 text-quasi-noir">
              <tr>
                <th className="px-6 py-4 font-bold font-display">Nom du Locataire</th>
                <th className="px-6 py-4 font-bold font-display">Contact</th>
                <th className="px-6 py-4 font-bold font-display">CNI</th>
                <th className="px-6 py-4 font-bold font-display text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {locataires.map((locataire) => (
                <tr key={locataire.id} className="hover:bg-sable-fond/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-quasi-noir">{locataire.prenom} {locataire.nom}</div>
                    {locataire.notes && <div className="text-xs text-ardoise-gris/70 mt-1 truncate max-w-xs">{locataire.notes}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <a href={`tel:${locataire.telephone}`} className="flex items-center gap-2 hover:text-indigo-principal transition-colors">
                        <Phone className="w-3 h-3" /> {locataire.telephone}
                      </a>
                      {locataire.email && (
                        <a href={`mailto:${locataire.email}`} className="flex items-center gap-2 hover:text-indigo-principal transition-colors">
                          <Mail className="w-3 h-3" /> {locataire.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {locataire.cni || <span className="text-ardoise-gris/50 italic">Non renseigné</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-principal hover:underline font-bold text-sm">
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
