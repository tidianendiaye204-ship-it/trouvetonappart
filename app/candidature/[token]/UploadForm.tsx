'use client'

import { useState } from 'react'
import { Upload, Loader2, Send } from 'lucide-react'
import { uploadDocument, submitDossier } from '@/app/actions/dossier'

export default function UploadForm({ 
  token, 
  docType, 
  hasFile,
  isSubmitMode,
  disabled 
}: { 
  token: string, 
  docType?: string, 
  hasFile?: boolean,
  isSubmitMode?: boolean,
  disabled?: boolean
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isSubmitMode) {
    const handleFinalSubmit = async () => {
      setIsUploading(true)
      const res = await submitDossier(token)
      if (!res.success) setError(res.error || 'Erreur inconnue')
      setIsUploading(false)
    }
    
    return (
      <div className="flex flex-col items-center">
        <button 
          onClick={handleFinalSubmit}
          disabled={disabled || isUploading}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-md transition-all ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-principal text-white hover:brightness-110 active:scale-95'}`}
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Soumettre mon dossier
        </button>
        {error && <p className="text-red-500 text-xs mt-2 font-bold">{error}</p>}
      </div>
    )
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !docType) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 5Mo.")
      return
    }

    setIsUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('token', token)
    formData.append('type', docType)

    const res = await uploadDocument(formData)
    
    if (!res.success) {
      setError(res.error || 'Erreur inconnue')
    }
    
    setIsUploading(false)
  }

  return (
    <div className="flex flex-col sm:items-end">
      <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border-2 ${hasFile ? 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100' : 'border-indigo-principal text-indigo-principal bg-white hover:bg-indigo-50 active:scale-95'}`}>
        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {hasFile ? 'Remplacer' : 'Uploader'}
        <input 
          type="file" 
          accept="image/jpeg,image/png,application/pdf"
          className="hidden" 
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
      {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
    </div>
  )
}
