'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, MessageCircle, Phone, Save, Activity, CheckCircle, XCircle } from 'lucide-react'

export default function AutomationsClient({ initialPreferences, initialHistory }: { initialPreferences: any, initialHistory: any[] }) {
  const defaultPref = {
    rappel_loyer_retard_whatsapp: false,
    rappel_loyer_retard_email: false,
    relance_lead_whatsapp: false,
    relance_lead_email: false,
    ...(initialPreferences || {})
  }
  const [pref, setPref] = useState(defaultPref)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const handleToggle = (key: string) => {
    setPref((p: any) => ({ ...p, [key]: !p[key] }))
  }

  const savePreferences = async () => {
    setIsSaving(true)
    await supabase.from('automations_preferences').update(pref).eq('profil_id', pref.profil_id)
    setIsSaving(false)
  }

  return (
    <div className="space-y-8">
      
      {/* PREFERENCES */}
      <div className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl text-quasi-noir">Règles d'envoi</h2>
          <button 
            onClick={savePreferences}
            disabled={isSaving}
            className="bg-indigo-principal hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Bloc Loyers */}
          <div className="space-y-4">
            <h3 className="font-bold text-ardoise-gris uppercase text-xs tracking-wider border-b border-ardoise-gris/10 pb-2">Rappels de Loyer (Retard)</h3>
            
            <label className="flex items-center justify-between p-3 rounded-xl border border-ardoise-gris/20 hover:bg-sable-fond/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pref.rappel_loyer_retard_whatsapp ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-quasi-noir">WhatsApp</p>
                  <p className="text-xs text-ardoise-gris">J+1 après échéance</p>
                </div>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-indigo-principal" checked={pref.rappel_loyer_retard_whatsapp} onChange={() => handleToggle('rappel_loyer_retard_whatsapp')} />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-ardoise-gris/20 hover:bg-sable-fond/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pref.rappel_loyer_retard_email ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-quasi-noir">Email</p>
                  <p className="text-xs text-ardoise-gris">J+3 après échéance</p>
                </div>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-indigo-principal" checked={pref.rappel_loyer_retard_email} onChange={() => handleToggle('rappel_loyer_retard_email')} />
            </label>
          </div>

          {/* Bloc CRM */}
          <div className="space-y-4">
            <h3 className="font-bold text-ardoise-gris uppercase text-xs tracking-wider border-b border-ardoise-gris/10 pb-2">Recontacter les intéressés</h3>
            
            <label className="flex items-center justify-between p-3 rounded-xl border border-ardoise-gris/20 hover:bg-sable-fond/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pref.relance_lead_whatsapp ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-quasi-noir">WhatsApp</p>
                  <p className="text-xs text-ardoise-gris">Date de "Prochaine relance"</p>
                </div>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-indigo-principal" checked={pref.relance_lead_whatsapp} onChange={() => handleToggle('relance_lead_whatsapp')} />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-ardoise-gris/20 hover:bg-sable-fond/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pref.relance_lead_email ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-quasi-noir">Email</p>
                  <p className="text-xs text-ardoise-gris">Date de "Prochaine relance"</p>
                </div>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-indigo-principal" checked={pref.relance_lead_email} onChange={() => handleToggle('relance_lead_email')} />
            </label>
          </div>

        </div>
      </div>

      {/* HISTORIQUE */}
      <div className="bg-white rounded-2xl border border-ardoise-gris/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-ardoise-gris/10 flex items-center gap-2">
          <Activity className="w-5 h-5 text-ardoise-gris" />
          <h2 className="font-bold text-lg text-quasi-noir">Historique d'envoi</h2>
        </div>
        
        {initialHistory.length === 0 ? (
          <div className="p-10 text-center text-ardoise-gris">
            Aucun message automatique n'a encore été envoyé.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-sable-fond/50">
              <tr>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs">Date</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs">Déclencheur</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs">Canal</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs">Destinataire</th>
                <th className="p-4 font-bold text-ardoise-gris uppercase text-xs">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {initialHistory.map((h: any) => (
                <tr key={h.id} className="hover:bg-sable-fond/30">
                  <td className="p-4 text-ardoise-gris">{new Date(h.created_at).toLocaleString('fr-FR')}</td>
                  <td className="p-4 font-medium text-quasi-noir">{h.trigger_type.replace('_', ' ')}</td>
                  <td className="p-4">
                    {h.channel === 'whatsapp' ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">WhatsApp</span> : 
                     h.channel === 'email' ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Email</span> : 
                     <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{h.channel}</span>}
                  </td>
                  <td className="p-4 text-ardoise-gris">{h.recipient}</td>
                  <td className="p-4">
                    {h.status === 'sent' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <span title={h.error_log}><XCircle className="w-5 h-5 text-red-500" /></span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
