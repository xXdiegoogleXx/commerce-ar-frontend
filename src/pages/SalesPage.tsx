import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi, productsApi } from '../services/api'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export function SalesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const { data: sales, isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => salesApi.list(),
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => salesApi.create(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setProductId('')
      setQuantity(1)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || quantity < 1) return
    createMutation.mutate()
  }

  return (
    <Layout>
      <h1 className="font-headline text-2xl font-bold mb-6 text-on-surface">Ventas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Register Sale Card - white on neutral */}
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
          <h2 className="font-headline text-lg font-semibold mb-4 text-on-surface">Registrar Venta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-on-surface-variant">Producto</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Seleccionar producto</option>
                {products?.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-on-surface-variant">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center py-3 px-4 bg-primary text-on-primary font-headline font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Registrar Venta
            </button>
          </form>
        </div>

        {/* Sales History Card */}
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
          <h2 className="font-headline text-lg font-semibold mb-4 text-on-surface">Historial de Ventas</h2>
          {loadingSales ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sales?.data?.map((sale) => (
                <div key={sale.id} className="border-b border-outline-variant pb-3">
                  <p className="font-body font-medium text-on-surface">${sale.total.toFixed(2)}</p>
                  <p className="text-sm font-body text-on-surface-variant">
                    {new Date(sale.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}