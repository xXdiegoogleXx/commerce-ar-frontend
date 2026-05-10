import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../services/api'
import type { Product } from '../services/types'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ProductsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

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

  const products: Product[] = data?.data || []

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Productos</h1>
        {isAdmin && (
          <button
            onClick={() => navigate('/products/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
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