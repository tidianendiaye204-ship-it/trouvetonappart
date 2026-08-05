import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { MapPin, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import UploadForm from '@/app/candidature/[token]/UploadForm'

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

export default async function CandidaturePage({ params }: { params: { token: string } }) {
  const { token } = params

  const { data: demande } = await supabaseAdmin
    .from('contacts_demandes')
    .select('id, nom_demandeur, dossier_statut, biens!inner(titre, adresse, ville, loyer)')
    .eq('dossier_token', token)
    .single()

  if (!demande) notFound()

  const { data: documents } = await supabaseAdmin
    .from('dossiers_documents')
    .select('*')
    .eq('demande_id', demande.id)

  const bien = Array.isArray(demande.biens) ? demande.biens[0] : demande.biens
  const isEnRevue = demande.dossier_statut === 'en_revue'
  const isValide = demande.dossier_statut === 'valide'
  const isRefuse = demande.dossier_statut === 'refuse'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-quasi-noir mb-2">
          Bonjour {demande.nom_demandeur},
        </h1>
        <p className="text-ardoise-gris">Constituez votre dossier de location pour le bien :</p>
        <div className="inline-flex items-center gap-2 mt-4 bg-indigo-50 text-indigo-principal px-4 py-2 rounded-xl font-bold">
          <MapPin className="w-5 h-5" />
          {bien.titre} — {bien.ville} ({bien.loyer} FCFA)
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
        <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-ardoise-gris/10">
            <h2 className="font-bold text-lg text-quasi-noir">Pièces requises</h2>
            <p className="text-sm text-ardoise-gris">Uploadez les documents ci-dessous (PDF, JPG ou PNG).</p>
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
            <UploadForm token={token} isSubmitMode disabled={!documents || documents.length < 2} />
            <p className="text-xs text-ardoise-gris mt-2">Vous devez fournir au moins la pièce d'identité et un justificatif de revenus pour soumettre le dossier.</p>
          </div>
        </div>
      )}
    </div>
  )
}
