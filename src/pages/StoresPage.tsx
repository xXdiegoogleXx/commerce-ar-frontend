import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storesApi, usersApi } from '../services/api'
import type { Store, User } from '../services/types'
import { Layout } from '../components/Layout'
import { Loader2, Plus, Trash2, Edit2, X } from 'lucide-react'

export function StoresPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [form, setForm] = useState({ name: '', address: '' })

  // User assignment state
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState('')

  const { data: storesData, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.list(),
  })

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const { data: storeUsers } = useQuery({
    queryKey: ['store-users', selectedStore],
    queryFn: () => storesApi.getUsers(selectedStore!),
    enabled: !!selectedStore,
  })

  const createMutation = useMutation({
    mutationFn: () => storesApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => storesApi.update(editingStore!.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  })

  const assignMutation = useMutation({
    mutationFn: () => storesApi.assignUser(selectedStore!, assignUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', selectedStore] })
      setAssignUserId('')
    },
  })

  const unassignMutation = useMutation({
    mutationFn: (userId: string) => storesApi.unassignUser(selectedStore!, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-users', selectedStore] }),
  })

  const resetForm = () => {
    setShowForm(false)
    setEditingStore(null)
    setForm({ name: '', address: '' })
  }

  const startEdit = (store: Store) => {
    setEditingStore(store)
    setForm({ name: store.name, address: store.address })
    setShowForm(true)
  }

  const stores: Store[] = storesData?.data || []
  const users: User[] = allUsers?.data || []

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Gestión de Tiendas</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Nueva Tienda
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); editingStore ? updateMutation.mutate() : createMutation.mutate() }} className="bg-surface-container-lowest p-6 rounded-lg shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-medium text-on-surface-variant">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-on-surface-variant">Dirección</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex justify-center px-4 py-2 bg-primary text-on-primary font-headline font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingStore ? 'Actualizar Tienda' : 'Crear Tienda'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-surface-container">Cancelar</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      ) : (
        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Dirección</th>
                <th className="px-6 py-3 text-right text-xs font-label font-medium text-on-surface-variant uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm font-body font-medium text-on-surface">{store.name}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{store.address}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedStore(selectedStore === store.id ? null : store.id)} className="text-primary hover:opacity-80 mr-3 text-sm">
                      Usuarios
                    </button>
                    <button onClick={() => startEdit(store)} className="text-primary hover:opacity-80 mr-3">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm('¿Eliminar tienda?')) deleteMutation.mutate(store.id) }} className="text-tertiary hover:opacity-80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Assignment Section */}
      {selectedStore && (
        <div className="mt-6 bg-surface-container-lowest p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Usuarios de la tienda
            </h2>
            <button onClick={() => setSelectedStore(null)} className="p-1 hover:bg-surface-container rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <select
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
              className="flex-1 rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none"
            >
              <option value="">Seleccionar usuario...</option>
              {users.filter((u) => !storeUsers?.data?.find((su: any) => su.id === u.id)).map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <button
              onClick={() => assignUserId && assignMutation.mutate()}
              disabled={!assignUserId}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Asignar
            </button>
          </div>

          <div className="space-y-2">
            {storeUsers?.data?.map((user: any) => (
              <div key={user.id} className="flex justify-between items-center px-4 py-2 bg-surface-container rounded-lg">
                <div>
                  <p className="text-sm font-body font-medium text-on-surface">{user.name}</p>
                  <p className="text-xs font-body text-on-surface-variant">{user.email} - {user.role}</p>
                </div>
                <button
                  onClick={() => unassignMutation.mutate(user.id)}
                  className="text-tertiary hover:opacity-80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {storeUsers?.data?.length === 0 && (
              <p className="text-sm text-on-surface-variant">No hay usuarios asignados</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
