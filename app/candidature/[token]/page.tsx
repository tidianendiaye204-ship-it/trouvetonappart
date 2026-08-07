import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { MapPin, FileCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import UploadForm from '@/app/candidature/[token]/UploadForm'
import DossierForm from '@/app/candidature/[token]/DossierForm'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DOC_TYPES = [
  { id: 'cni', label: 'Pièce d\'identité (Recto/Verso)' },
  { id: 'fiches_paie', label: '3 dernières fiches de paie' },
  { id: 'contrat_travail', label: 'Contrat de travail' },
  { id: 'garant_cni', label: 'Pièce d\'identité du garant' },
  { id: 'garant_revenus', label: 'Revenus du garant' }
]

export default async function CandidaturePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: demande, error: demandeError } = await supabaseAdmin
    .from('contacts_demandes')
    .select('id, nom_demandeur, dossier_statut, email_demandeur, profession, revenu_mensuel, type_garant, type_piece, biens!inner(titre, adresse, ville, prix)')
    .eq('dossier_token', token)
    .single()

  if (demandeError) {
    console.error("Erreur DB CandidaturePage:", demandeError)
    // If it's a "column does not exist" error, the migration hasn't been run
    if (demandeError.code === 'PGRST200') {
      return (
        <div className="p-8 bg-red-50 text-red-600 rounded-2xl m-4 text-center">
          <h2 className="font-bold text-xl mb-2">Erreur de base de données</h2>
          <p>La migration SQL n'a pas été exécutée. Veuillez exécuter <code>migration_dossier_v2.sql</code> dans votre base Supabase.</p>
        </div>
      )
    }
  }

  if (!demande) notFound()

  const { data: documents } = await supabaseAdmin
    .from('dossiers_documents')
    .select('*')
    .eq('demande_id', demande.id)

  const bien = Array.isArray(demande.biens) ? demande.biens[0] : demande.biens
  const isEnRevue = demande.dossier_statut === 'en_revue'
  const isValide = demande.dossier_statut === 'valide'
  const isRefuse = demande.dossier_statut === 'refuse'

  // Calcul du taux de complétion (Formulaire = 50%, Pièces = 50%)
  const formFields = [demande.email_demandeur, demande.profession, demande.revenu_mensuel, demande.type_garant, demande.type_piece]
  const formFilledCount = formFields.filter(Boolean).length
  const formComplete = formFilledCount === 5
  
  // On exige au moins CNI et Fiche de paie (ou garant) pour considérer les pièces complètes
  const hasCni = documents?.some(d => d.type_document === 'cni')
  const hasRevenus = documents?.some(d => d.type_document === 'fiches_paie' || d.type_document === 'garant_revenus')
  const docsComplete = hasCni && hasRevenus

  let progress = 0
  if (formComplete) progress += 50
  else progress += (formFilledCount / 5) * 50
  if (docsComplete) progress += 50
  else if (hasCni || hasRevenus) progress += 25

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-quasi-noir mb-2">
          Bonjour {demande.nom_demandeur},
        </h1>
        <p className="text-ardoise-gris">Constituez votre dossier de location pour le bien :</p>
        <div className="inline-flex items-center gap-2 mt-4 bg-indigo-50 text-indigo-principal px-4 py-2 rounded-xl font-bold">
          <MapPin className="w-5 h-5" />
          {bien.titre} — {bien.ville} ({bien.prix?.toLocaleString('fr-FR')} FCFA)
        </div>
      </div>

      {(isEnRevue || isValide || isRefuse) ? (
        <div className={`rounded-2xl p-8 text-center border shadow-sm ${
          isValide ? 'bg-green-50 border-green-100' :
          isRefuse ? 'bg-red-50 border-red-100' :
          'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex justify-center mb-4">
            {isValide ? <CheckCircle2 className="w-16 h-16 text-green-600" /> :
             isRefuse ? <AlertCircle className="w-16 h-16 text-red-600" /> :
             <FileCheck className="w-16 h-16 text-blue-600" />}
          </div>
          <h2 className={`text-2xl font-black mb-2 ${
            isValide ? 'text-green-700' :
            isRefuse ? 'text-red-700' :
            'text-blue-700'
          }`}>
            {isValide ? 'Dossier validé !' :
             isRefuse ? 'Dossier refusé' :
             'Dossier en cours d\'analyse'}
          </h2>
          <p className={isValide ? 'text-green-600' : isRefuse ? 'text-red-600' : 'text-blue-600'}>
            {isValide ? 'Félicitations, votre dossier a été accepté par le propriétaire.' :
             isRefuse ? 'Malheureusement, votre dossier n\'a pas été retenu pour ce bien.' :
             'Votre dossier a été transmis au propriétaire. Vous serez contacté très prochainement.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Jauge de progression */}
          <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-quasi-noir">Progression du dossier</h2>
              <span className="text-sm font-black text-indigo-principal">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-sable-fond rounded-full h-2.5 overflow-hidden">
              <div className="bg-indigo-principal h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <DossierForm 
            token={token} 
            initialData={{
              email_demandeur: demande.email_demandeur,
              profession: demande.profession,
              revenu_mensuel: demande.revenu_mensuel,
              type_garant: demande.type_garant,
              type_piece: demande.type_piece
            }} 
          />

          <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-ardoise-gris/10">
              <h2 className="font-bold text-lg text-quasi-noir">Étape 2 : Pièces requises</h2>
              <p className="text-sm text-ardoise-gris">Uploadez les documents ci-dessous (PDF, JPG ou PNG) pour finaliser votre dossier.</p>
            </div>
            <div className="divide-y divide-ardoise-gris/10">
              {DOC_TYPES.map((docType) => {
                const uploadedDoc = documents?.find(d => d.type_document === docType.id)
                return (
                  <div key={docType.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sable-fond/30 transition-colors">
                    <div>
                      <h3 className="font-bold text-quasi-noir">{docType.label}</h3>
                      {uploadedDoc && (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Reçu ({uploadedDoc.statut_validation})
                        </span>
                      )}
                    </div>
                    <UploadForm token={token} docType={docType.id} hasFile={!!uploadedDoc} />
                  </div>
                )
              })}
            </div>
            
            <div className="p-6 bg-sable-fond border-t border-ardoise-gris/10 text-center">
              <UploadForm token={token} isSubmitMode disabled={!formComplete || !docsComplete} />
              <p className="text-xs text-ardoise-gris mt-2">Vous devez compléter l'Étape 1 et fournir au moins la pièce d'identité et un justificatif de revenus pour soumettre.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
