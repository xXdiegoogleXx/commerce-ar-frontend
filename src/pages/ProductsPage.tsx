import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, importApi } from '../services/api'
import type { Product } from '../services/types'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useImport } from '../context/ImportContext'
import { ColumnMappingModal } from '../components/ColumnMappingModal'
import { Loader2, Plus, Pencil, Trash2, Search, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ImportProgressBar } from '../components/ImportProgressBar'

export function ProductsPage() {
  const { isAdmin } = useAuth()
  const { startImport, importStatus } = useImport()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [dbFields, setDbFields] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category],
    queryFn: () => productsApi.list(search, category),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar producto?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data: columns } = await importApi.detectColumns(file)
      setPendingFile(file)
      setCsvHeaders(columns.headers)
      setDbFields(columns.dbFields)
    } catch (err) {
      console.error('Failed to detect columns:', err)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImportConfirm = async (mapping: Record<string, string>) => {
    if (!pendingFile) return
    setPendingFile(null)
    setCsvHeaders([])
    setDbFields([])
    await startImport(pendingFile, mapping)
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const handleMappingCancel = () => {
    setPendingFile(null)
    setCsvHeaders([])
    setDbFields([])
  }

  const products: Product[] = data?.data || []

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Productos</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Subiendo...' : 'Importar CSV'}
            </button>
            <button
              onClick={() => navigate('/products/new')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          <option value="Gadgets">Gadgets</option>
          <option value="Tools">Tools</option>
          <option value="Electronics">Electronics</option>
          <option value="Home">Home</option>
          <option value="Office">Office</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <ImportProgressBar />

      {csvHeaders.length > 0 && (
        <ColumnMappingModal
          csvHeaders={csvHeaders}
          dbFields={dbFields}
          onConfirm={handleImportConfirm}
          onCancel={handleMappingCancel}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Código Barra</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Stock</th>
                {isAdmin && <th className="px-6 py-3 text-right text-xs font-label font-medium text-on-surface-variant uppercase">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm font-body font-medium text-on-surface">{product.name}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{product.brand}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant font-mono">{product.barcode || '-'}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{product.stock}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="text-primary hover:opacity-80 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-tertiary hover:opacity-80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}