import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { FileText, MapPin, AlertCircle, CheckCircle2, Download, CreditCard, MessageCircle } from 'lucide-react'

// On utilise le service_role car le locataire n'est PAS authentifié via Auth
// Le token fait office d'authentification.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PortailLocatairePage({
  params
}: {
  params: { token: string }
}) {
  const { token } = params

  // 1. Récupérer le locataire via le token
  const { data: locataire } = await supabaseAdmin
    .from('locataires')
    .select('id, prenom, nom, telephone, proprietaire_id, profiles!inner(telephone)')
    .eq('access_token', token)
    .single()

  if (!locataire) {
    notFound()
  }

  // 2. Récupérer le bail actif et le bien
  const { data: baux } = await supabaseAdmin
    .from('baux')
    .select('id, loyer_mensuel, date_debut, date_fin, statut, biens!inner(titre, adresse, ville)')
    .eq('locataire_id', locataire.id)
    .eq('statut', 'actif')
    .order('created_at', { ascending: false })
    .limit(1)

  const bail = baux?.[0]
  if (!bail) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-black mb-4">Aucun contrat actif</h1>
        <p className="text-ardoise-gris">Vous n'avez pas de contrat de location en cours.</p>
      </div>
    )
  }

  const bien = Array.isArray(bail.biens) ? bail.biens[0] : bail.biens
  const propTelephone = Array.isArray(locataire.profiles) ? locataire.profiles[0].telephone : (locataire.profiles as any)?.telephone

  // 3. Récupérer l'historique des paiements du bail
  const { data: paiements } = await supabaseAdmin
    .from('paiements')
    .select('*')
    .eq('bail_id', bail.id)
    .order('annee', { ascending: false })
    .order('mois', { ascending: false })
    .limit(12)

  // Statistiques rapides
  const aPayer = paiements?.filter(p => p.statut === 'impaye' || p.statut === 'en_retard') || []
  const totalAPayer = aPayer.reduce((sum, p) => sum + Number(p.montant), 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER BIENVENUE */}
      <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-quasi-noir mb-1">
            Bonjour, {locataire.prenom} {locataire.nom}
          </h1>
          <div className="flex items-center gap-2 text-ardoise-gris text-sm">
            <MapPin className="w-4 h-4" />
            {bien.titre} — {bien.ville}
          </div>
        </div>

        {propTelephone && (
          <a 
            href={`https://wa.me/${propTelephone.replace('+', '')}?text=Bonjour, je vous contacte depuis mon espace locataire concernant le bien "${bien.titre}"`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" /> Contacter mon propriétaire
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* COLONNE GAUCHE : STATUT FINANCIER */}
        <div className="md:col-span-2 space-y-6">
          
          {/* BANNIERE A PAYER */}
          {totalAPayer > 0 ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-700 mb-1">Solde à régler</h2>
                  <p className="text-sm text-red-600 mb-4">Vous avez {aPayer.length} loyer(s) en attente de paiement.</p>
                  <p className="text-3xl font-black text-red-700 mb-4">{totalAPayer.toLocaleString('fr-FR')} FCFA</p>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Payer maintenant en ligne
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-center gap-4">
               <div className="p-3 bg-green-100 text-green-600 rounded-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-700">Votre compte est à jour !</h2>
                  <p className="text-sm text-green-600">Aucun loyer en retard. Merci de votre ponctualité.</p>
                </div>
            </div>
          )}

          {/* HISTORIQUE PAIEMENTS */}
          <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-ardoise-gris/10">
              <h2 className="font-bold text-lg text-quasi-noir">Historique des paiements</h2>
            </div>
            
            <div className="divide-y divide-ardoise-gris/10">
              {paiements?.map((p) => (
                <div key={p.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sable-fond/30 transition-colors">
                  <div>
                    <p className="font-bold text-quasi-noir capitalize">{new Date(p.annee, p.mois - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                    <p className="text-sm text-ardoise-gris">{Number(p.montant).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-1/2">
                    {p.statut === 'paye' ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Réglé le {p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    ) : p.statut === 'en_retard' || p.statut === 'impaye' ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> À régler
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">En attente</span>
                    )}

                    {p.statut === 'paye' && (
                      <button className="text-indigo-principal hover:bg-indigo-50 p-2 rounded-lg transition-colors" title="Télécharger la quittance">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {!paiements?.length && (
                <div className="p-8 text-center text-ardoise-gris">Aucun historique disponible.</div>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : INFO CONTRAT */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm">
            <h2 className="font-bold text-lg text-quasi-noir mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-principal" /> Mon Contrat
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-ardoise-gris text-xs font-bold uppercase tracking-wider mb-1">Loyer Mensuel</p>
                <p className="font-bold text-lg text-quasi-noir">{Number(bail.loyer_mensuel).toLocaleString('fr-FR')} FCFA</p>
              </div>
              
              <div>
                <p className="text-ardoise-gris text-xs font-bold uppercase tracking-wider mb-1">Date d'entrée</p>
                <p className="font-medium text-quasi-noir">{new Date(bail.date_debut).toLocaleDateString('fr-FR')}</p>
              </div>
              
              {bail.date_fin && (
                <div>
                  <p className="text-ardoise-gris text-xs font-bold uppercase tracking-wider mb-1">Fin du contrat</p>
                  <p className="font-medium text-quasi-noir">{new Date(bail.date_fin).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
