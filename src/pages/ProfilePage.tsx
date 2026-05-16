import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../services/api'
import type { User } from '../services/types'
import { Layout } from '../components/Layout'
import { Loader2 } from 'lucide-react'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const { user: authUser } = useAuth()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['user-me', authUser?.id],
    queryFn: () => usersApi.getMe(),
    staleTime: 0,
    enabled: !!authUser,
  })

  const user: User | undefined = data?.data

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone)
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: () => usersApi.updateMe({ phone }),
    onSuccess: () => {
      setSuccess(true)
      setError('')
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Error al actualizar teléfono')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    updateMutation.mutate()
  }

  if (isLoading) {
    return (
      <Layout>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-6">Mi Perfil</h1>

        <div className="bg-surface-container-lowest rounded-lg shadow-sm p-6 space-y-6">
          {/* Datos del usuario (solo lectura) */}
          <div className="border-b pb-4">
            <h2 className="text-sm font-label font-medium text-on-surface-variant uppercase mb-3">Información Personal</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant">Nombre</label>
                <p className="text-sm font-body text-on-surface">{user?.name}</p>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant">Email</label>
                <p className="text-sm font-body text-on-surface">{user?.email}</p>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant">Rol</label>
                <p className="text-sm font-body text-on-surface">{user?.role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant">Documento</label>
                <p className="text-sm font-body text-on-surface">{user?.documentNumber || 'No registrado'}</p>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant">Sexo</label>
                <p className="text-sm font-body text-on-surface">{user?.gender || 'No registrado'}</p>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant">Fecha de nacimiento</label>
                <p className="text-sm font-body text-on-surface">{user?.birthDate ? new Date(user.birthDate).toLocaleDateString('es-AR') : 'No registrada'}</p>
              </div>
            </div>
          </div>

          {/* Editar teléfono (solo editable) */}
          <div>
            <h2 className="text-sm font-label font-medium text-on-surface-variant uppercase mb-3">Editar Teléfono</h2>
            
            {success && (
              <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-sm">
                Teléfono actualizado correctamente
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9XXXXXXXX"
                  className="w-full px-4 py-2 rounded-lg bg-surface-container font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-on-surface-variant">Formato: +54 9XXXXXXXX</p>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-headline font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Actualizar Teléfono
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}