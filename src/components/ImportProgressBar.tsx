import { useImport } from '../context/ImportContext'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { X, CheckCircle, AlertTriangle } from 'lucide-react'

export function ImportProgressBar() {
  const { importStatus, clearImport } = useImport()
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
  }, [location.pathname])

  if (!importStatus || dismissed || location.pathname !== '/products') return null

  const isDone = importStatus.status === 'completed' || importStatus.status === 'completed_with_errors' || importStatus.status === 'failed'
  const percent = importStatus.total > 0 ? Math.round((importStatus.processed / importStatus.total) * 100) : 0
  const hasErrors = importStatus.errors.length > 0

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant p-4 z-50">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-headline font-bold text-on-surface">
          {isDone ? 'Importación finalizada' : 'Importando productos...'}
        </h4>
        <button onClick={() => { clearImport(); setDismissed(true) }} className="p-1 hover:bg-surface-container rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isDone && (
        <div className="mb-2">
          <div className="w-full bg-surface-container rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs font-body text-on-surface-variant mt-1">
            {importStatus.processed} / {importStatus.total} productos
          </p>
        </div>
      )}

      {isDone && (
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <p className="text-sm font-body text-on-surface">
            {hasErrors
              ? `${importStatus.processed} procesados, ${importStatus.errors.length} errores`
              : `${importStatus.processed} productos procesados`}
          </p>
        </div>
      )}
    </div>
  )
}
