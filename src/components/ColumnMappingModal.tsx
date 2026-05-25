import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  csvHeaders: string[]
  dbFields: string[]
  onConfirm: (mapping: Record<string, string>) => void
  onCancel: () => void
}

function guessMapping(csvHeaders: string[], dbFields: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  const dbLower = dbFields.map((f) => f.toLowerCase())
  for (const header of csvHeaders) {
    const h = header.toLowerCase().replace(/[\s_-]/g, '')
    let bestMatch = ''
    let bestScore = 0
    for (const dbField of dbFields) {
      const d = dbField.toLowerCase()
      if (h === d) { bestMatch = dbField; bestScore = 99; break }
      if (h.includes(d) || d.includes(h)) { bestMatch = dbField; bestScore = 50; break }
      const idx = dbLower.indexOf(d)
      if (h.includes(dbLower[idx]) || dbLower[idx].includes(h)) { bestMatch = dbField; bestScore = 50; break }
      const wordMatch = dbField.toLowerCase().split(/_/).some((part) => h.includes(part))
      if (wordMatch && bestScore < 30) { bestMatch = dbField; bestScore = 30 }
    }
    mapping[header] = bestMatch
  }
  return mapping
}

export function ColumnMappingModal({ csvHeaders, dbFields, onConfirm, onCancel }: Props) {
  const [mapping, setMapping] = useState<Record<string, string>>(() => guessMapping(csvHeaders, dbFields))

  const setColMapping = (csvCol: string, dbField: string) => {
    setMapping((prev) => ({ ...prev, [csvCol]: dbField }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="font-headline text-lg font-bold text-on-surface">Mapeo de Columnas CSV</h2>
          <button onClick={onCancel} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-sm text-on-surface-variant">
            Seleccioná a qué campo de la base de datos corresponde cada columna del CSV.
            Las columnas sin mapear se guardarán como metadatos.
          </p>
          {csvHeaders.map((header) => (
            <div key={header} className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-medium text-on-surface truncate">{header}</span>
              <span className="text-on-surface-variant">&rarr;</span>
              <select
                value={mapping[header] || ''}
                onChange={(e) => setColMapping(header, e.target.value)}
                className="flex-1 rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">— Guardar como metadata —</option>
                {dbFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-outline-variant">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            className="px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg hover:opacity-90"
          >
            Importar
          </button>
        </div>
      </div>
    </div>
  )
}
