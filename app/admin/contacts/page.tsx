import { createClient } from '@/lib/supabase/server'
import { MessageCircle, ExternalLink, CalendarDays } from 'lucide-react'
import Link from 'next/link'

export default async function AdminContactsPage() {
  const supabase = await createClient()

  // Fetch all contacts, including property and owner info
  const { data: contacts, error } = await supabase
    .from('contacts_demandes')
    .select(`
      id,
      nom_demandeur,
      telephone_demandeur,
      message,
      created_at,
      statut,
      biens (
        id,
        titre,
        proprietaire_id,
        profiles (
          nom,
          telephone
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Erreur lors du chargement des contacts : {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-indigo-principal" />
          Contacts & Leads
        </h1>
        <p className="text-ardoise-gris">
          Visualisez en temps réel tous les clients ayant contacté les propriétaires via la plateforme.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-ardoise-gris/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-sable-fond/50 text-ardoise-gris text-xs uppercase tracking-wider">
                <th className="p-4 font-bold rounded-tl-3xl">Date</th>
                <th className="p-4 font-bold">Client (Qui a contacté ?)</th>
                <th className="p-4 font-bold">Message</th>
                <th className="p-4 font-bold">Propriétaire & Annonce (Qui a reçu ?)</th>
                <th className="p-4 font-bold rounded-tr-3xl text-right">Statut (Côté Pro)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {contacts?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ardoise-gris">
                    Aucun lead généré pour le moment.
                  </td>
                </tr>
              ) : null}

              {contacts?.map((contact: any) => (
                <tr key={contact.id} className="hover:bg-sable-fond/30 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-quasi-noir">
                      <CalendarDays className="w-4 h-4 text-ardoise-gris" />
                      {new Date(contact.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-quasi-noir text-sm">{contact.nom_demandeur}</p>
                    <a href={`tel:${contact.telephone_demandeur}`} className="text-xs text-indigo-principal hover:underline">
                      {contact.telephone_demandeur}
                    </a>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-ardoise-gris max-w-xs truncate" title={contact.message || 'Aucun message'}>
                      {contact.message ? `"${contact.message}"` : <span className="italic">Aucun message</span>}
                    </p>
                  </td>
                  <td className="p-4 text-sm">
                    {contact.biens ? (
                      <>
                        <p className="font-bold text-quasi-noir">
                          {contact.biens.profiles?.nom || 'Propriétaire inconnu'}
                        </p>
                        <p className="text-xs text-ardoise-gris line-clamp-1 mb-1">
                          Pour: {contact.biens.titre}
                        </p>
                        <Link
                          href={`/annonce/${contact.biens.id}`}
                          target="_blank"
                          className="text-[10px] font-bold text-indigo-principal flex items-center gap-1 hover:underline w-fit"
                        >
                          Voir l'annonce <ExternalLink className="w-3 h-3" />
                        </Link>
                      </>
                    ) : (
                      <span className="text-ardoise-gris italic">Annonce supprimée</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      contact.statut === 'nouveau' ? 'bg-blue-100 text-blue-700' :
                      contact.statut === 'converti' ? 'bg-green-100 text-green-700' :
                      contact.statut === 'perdu' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {contact.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
