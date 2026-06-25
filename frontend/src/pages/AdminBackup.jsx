import React, { useState } from 'react'
import { useToast } from '../components/Toast'
import { Download, Upload, Loader2, Shield, Database, Image } from 'lucide-react'
import { adminBackupDownload, adminBackupRestore } from '../api'

export default function AdminBackup() {
  const { showToast } = useToast()
  const [downloading, setDownloading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreFile, setRestoreFile] = useState(null)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await adminBackupDownload()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.zip`
      a.click()
      window.URL.revokeObjectURL(url)
      showToast('Backup descargado correctamente', 'success')
    } catch {
      showToast('Error al descargar backup', 'error')
    }
    setDownloading(false)
  }

  const handleRestore = async () => {
    if (!restoreFile) return
    if (!confirm('¿Restaurar backup? Se reemplazarán TODOS los datos actuales y el servidor se reiniciará.')) return
    setRestoring(true)
    try {
      await adminBackupRestore(restoreFile)
      showToast('Backup restaurado. El servidor se está reiniciando...', 'success')
      setTimeout(() => window.location.reload(), 5000)
    } catch (err) {
      showToast(err?.response?.data?.error || 'Error al restaurar backup', 'error')
    }
    setRestoring(false)
  }

  return (
    <div>
      <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Shield size={20} className="text-emerald-400" /> Backup y Restauración
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Descargá un backup completo (base de datos + fotos) o restaurá desde uno anterior.
          Los backups contienen toda la información del gimnasio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download */}
          <div className="bg-gym-900/50 border border-gym-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Download size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Descargar Backup</h3>
                <p className="text-xs text-gray-500">Incluye DB + fotos de progreso</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Database size={12} className="text-gym-300" /> fittraining.db
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Image size={12} className="text-gym-300" /> uploads/ (mediciones, avatares)
              </div>
            </div>
            <button onClick={handleDownload} disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-50">
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? 'Descargando...' : 'Descargar Backup (.zip)'}
            </button>
          </div>

          {/* Restore */}
          <div className="bg-gym-900/50 border border-gym-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Upload size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Restaurar Backup</h3>
                <p className="text-xs text-gray-500">Reemplaza todos los datos actuales</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gym-600 rounded-xl cursor-pointer hover:border-gym-500 transition bg-gym-900/30">
                <Upload size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">{restoreFile ? restoreFile.name : 'Seleccionar archivo .zip'}</span>
                <input type="file" accept=".zip" className="hidden"
                  onChange={e => setRestoreFile(e.target.files[0])} />
              </label>
            </div>
            <button onClick={handleRestore} disabled={restoring || !restoreFile}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-50">
              {restoring ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {restoring ? 'Restaurando...' : 'Restaurar Backup'}
            </button>
            {restoreFile && (
              <p className="text-xs text-gym-400 mt-2 text-center">
                Se reemplazarán todos los datos. El servidor se reiniciará automáticamente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
