import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../services/api'
import type { User } from '../services/types'
import { Layout } from '../components/Layout'
import { Loader2, Plus, Trash2 } from 'lucide-react'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'seller' })

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false)
      setForm({ email: '', password: '', name: '', role: 'seller' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate()
  }

  const users: User[] = data?.data || []

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Usuarios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
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
          <div>
            <label className="block text-sm font-body font-medium text-on-surface-variant">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 block w-full rounded-lg bg-surface-container px-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex justify-center px-4 py-2 bg-primary text-on-primary font-headline font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Crear Usuario
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
                <th className="px-6 py-3 text-left text-xs font-label font-medium text-on-surface-variant uppercase">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-label font-medium text-on-surface-variant uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-sm font-body font-medium text-on-surface">{user.name}</td>
                  <td className="px-6 py-4 text-sm font-body text-on-surface-variant">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-label ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {user.role === 'admin' ? 'Admin' : 'Vendedor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
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