import { createClient } from '@/lib/supabase/server'
import { FileClock, User } from 'lucide-react'

export default async function AdminLogsPage() {
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('admin_logs')
    .select(`
      *,
      profiles(nom)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return <div>Erreur de chargement des logs: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-quasi-noir mb-2">Logs d'Administration</h1>
        <p className="text-ardoise-gris">Historique inaltérable des 100 dernières actions effectuées par les administrateurs.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sable-fond/50 text-ardoise-gris text-xs uppercase tracking-wider">
                <th className="p-4 font-bold rounded-l-xl">Date</th>
                <th className="p-4 font-bold">Admin</th>
                <th className="p-4 font-bold">Action</th>
                <th className="p-4 font-bold">Cible (ID)</th>
                <th className="p-4 font-bold rounded-r-xl">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-gris/10">
              {logs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-ardoise-gris">
                    Aucun log disponible.
                  </td>
                </tr>
              ) : null}

              {logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-sable-fond/30 transition-colors">
                  <td className="p-4 text-xs text-ardoise-gris">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-quasi-noir text-white rounded-full flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="font-bold text-sm text-quasi-noir">{log.profiles?.nom}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-indigo-principal/10 text-indigo-principal rounded text-xs font-bold font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-ardoise-gris">
                    {log.cible_id || '-'}
                  </td>
                  <td className="p-4">
                    <pre className="text-[10px] bg-sable-fond p-2 rounded text-quasi-noir overflow-x-auto max-w-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
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
