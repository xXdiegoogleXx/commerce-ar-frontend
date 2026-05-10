import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../services/api'
import { Layout } from '../components/Layout'
import { DollarSign, Package, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function DashboardPage() {
  const { isAdmin } = useAuth()
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getMetrics(),
    enabled: isAdmin,
  })

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="font-headline font-semibold text-on-surface-variant">Acceso Restringido</h2>
          <p className="font-body text-on-surface-variant mt-2">Solo administradores pueden ver el dashboard.</p>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  const metrics = data?.data

  return (
    <Layout>
      <h1 className="font-headline text-2xl font-bold mb-6 text-on-surface">Dashboard</h1>
      {/* Metric Cards - white cards on neutral background */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-body text-on-surface-variant">Ventas Totales</p>
              <p className="text-2xl font-headline font-bold text-on-surface">${metrics?.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-body text-on-surface-variant">Productos</p>
              <p className="text-2xl font-headline font-bold text-on-surface">{metrics?.topProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-body text-on-surface-variant">Período</p>
              <p className="text-sm font-body font-medium text-on-surface">
                {metrics?.period.start && new Date(metrics.period.start).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Top Products Table */}
      <div className="mt-8">
        <h2 className="font-headline text-lg font-semibold mb-4 text-on-surface">Productos Más Vendidos</h2>
        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Producto ID</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {metrics?.topProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm font-body text-on-surface">{item.productId}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface">{item._sum.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}