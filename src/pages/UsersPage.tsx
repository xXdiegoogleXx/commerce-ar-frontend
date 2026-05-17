import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, storesApi } from '../services/api'
import type { User, Gender, Store } from '../services/types'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react'
import { UserFormFields } from '../components/UserFormFields'

export function UsersPage() {
  const { isSuperAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'seller',
    documentNumber: '',
    phone: '',
    birthDate: '',
    gender: null as Gender | null,
    storeId: ''
  })

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const { data: storesData } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.list(),
    enabled: isSuperAdmin,
  })

  const { data: userStoresData } = useQuery({
    queryKey: ['store-users', editingUserId],
    queryFn: () => storesApi.getUsers(editingUserId!).then(r => r.data),
    enabled: isSuperAdmin && !!editingUserId,
  })

  const stores: Store[] = storesData?.data || []
  const userCurrentStore = stores.find(s => (userStoresData as any)?.find((u: any) => u.id === editingUserId))

  const createMutation = useMutation({
    mutationFn: () => usersApi.create({ ...form, storeId: form.storeId || undefined } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false)
      setForm({ email: '', password: '', name: '', role: 'seller', documentNumber: '', phone: '', birthDate: '', gender: null, storeId: '' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (id: string) => usersApi.update(id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false)
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && form.id) {
      updateMutation.mutate(form.id)
    } else {
      createMutation.mutate()
    }
  }

  const users: User[] = data?.data || []

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Gestión de Usuarios</h1>
        <button
          onClick={() => { setShowForm(!showForm); setIsEditing(false); setForm({ email: '', password: '', name: '', role: 'seller', documentNumber: '', phone: '', birthDate: '', gender: null, storeId: '' }) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 rounded-lg shadow-sm mb-6 space-y-4">
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
              <label className="block text-sm font-body font-medium text-on-surface-variant">Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none"
              >
                <option value="seller">Vendedor</option>
                <option value="admin">Administrador</option>
                {isSuperAdmin && <option value="super_admin">Super Administrador</option>}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-body font-medium text-on-surface-variant">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          {!isEditing && (
            <div>
              <label className="block text-sm font-body font-medium text-on-surface-variant">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                required={!isEditing}
                minLength={6}
              />
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Datos Personales</h3>
            <UserFormFields
              documentNumber={form.documentNumber}
              phone={form.phone}
              birthDate={form.birthDate}
              gender={form.gender}
              onDocumentNumberChange={(v) => setForm({ ...form, documentNumber: v })}
              onPhoneChange={(v) => setForm({ ...form, phone: v })}
              onBirthDateChange={(v) => setForm({ ...form, birthDate: v })}
              onGenderChange={(v) => setForm({ ...form, gender: v })}
              disabled={createMutation.isPending || updateMutation.isPending}
              required={false}
            />
          </div>

          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-body font-medium text-on-surface-variant">
                {isEditing ? 'Tienda asignada' : 'Asignar a Tienda'}
              </label>
              <select
                value={form.storeId}
                onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none"
              >
                <option value="">Sin tienda</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex justify-center px-4 py-2 bg-primary text-on-primary font-headline font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-label font-medium text-on-surface-variant uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm font-body font-medium text-on-surface">{user.name}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{user.email}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{user.documentNumber || '-'}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{user.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-label ${
                      user.role === 'super_admin' ? 'bg-tertiary/20 text-tertiary' :
                      user.role === 'admin' ? 'bg-primary/20 text-primary' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>
                      {user.role === 'super_admin' ? 'Super Admin' :
                       user.role === 'admin' ? 'Admin' : 'Vendedor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        const currentStoreId = (user as any).stores?.[0]?.id || ''
                        setForm({ ...form, id: user.id, email: user.email, name: user.name, role: user.role, documentNumber: user.documentNumber || '', phone: user.phone || '', birthDate: user.birthDate ? user.birthDate.split('T')[0] : '', gender: user.gender, storeId: currentStoreId })
                        setIsEditing(true)
                        setShowForm(true)
                      }}
                      className="text-primary hover:opacity-80 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar usuario?')) deleteMutation.mutate(user.id)
                      }}
                      className="text-tertiary hover:opacity-80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}