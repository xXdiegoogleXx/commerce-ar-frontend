import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { importApi } from '../services/api'

interface ImportStatus {
  status: string
  total: number
  processed: number
  errors: { row: number; error: string }[]
  importId: string
}

interface ImportContextType {
  importStatus: ImportStatus | null
  startImport: (file: File, columnMapping?: Record<string, string>) => Promise<string>
  clearImport: () => void
}

const ImportContext = createContext<ImportContextType | undefined>(undefined)

export function ImportProvider({ children }: { children: ReactNode }) {
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null)
  const [pollingId, setPollingId] = useState<ReturnType<typeof setInterval> | null>(null)
  const location = useLocation()

  const stopPolling = useCallback(() => {
    if (pollingId) {
      clearInterval(pollingId)
      setPollingId(null)
    }
  }, [pollingId])

  useEffect(() => {
    return () => stopPolling()
  }, [location.pathname, stopPolling])

  const startImport = async (file: File, columnMapping: Record<string, string> = {}) => {
    stopPolling()
    const { data } = await importApi.start(file, columnMapping)
    setImportStatus({ ...data, processed: 0, total: 0, errors: [] })

    const id = setInterval(async () => {
      try {
        const { data: status } = await importApi.status(data.importId)
        setImportStatus(status)
        if (status.status === 'completed' || status.status === 'completed_with_errors' || status.status === 'failed') {
          clearInterval(id)
          setPollingId(null)
        }
      } catch {
        clearInterval(id)
        setPollingId(null)
      }
    }, 2000)
    setPollingId(id)

    return data.importId
  }

  const clearImport = () => {
    stopPolling()
    setImportStatus(null)
  }

  return (
    <ImportContext.Provider value={{ importStatus, startImport, clearImport }}>
      {children}
    </ImportContext.Provider>
  )
}

export function useImport() {
  const context = useContext(ImportContext)
  if (!context) throw new Error('useImport must be used within ImportProvider')
  return context
}
