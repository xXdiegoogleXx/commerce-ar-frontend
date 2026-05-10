import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="w-full max-w-md px-4 mx-auto">
        {/* Clean white card on neutral background */}
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm">
          {/* Header - Manrope for headlines */}
          <header className="mb-10 text-center">
            <h1 className="font-headline font-extrabold text-2xl tracking-tight text-primary mb-6">
              SaaS Ventas
            </h1>
            <h2 className="font-headline font-bold text-3xl text-on-surface mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="font-body text-on-surface-variant">
              Manage your collection with purpose.
            </p>
          </header>
          
          {/* Error Message */}
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-sm font-body">
              {error}
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                className="block text-xs font-label font-semibold text-on-surface-variant tracking-wider uppercase" 
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="w-full bg-surface-container px-4 py-3 rounded-lg border border-transparent focus:border-primary focus:ring-0 font-body text-sm text-on-surface transition-all placeholder:text-outline-variant"
                id="email"
                name="email"
                placeholder="curator@business.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label 
                  className="block text-xs font-label font-semibold text-on-surface-variant tracking-wider uppercase" 
                  htmlFor="password"
                >
                  Password
                </label>
                <a 
                  className="text-xs font-label text-primary font-semibold hover:opacity-80 transition-opacity" 
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                className="w-full bg-surface-container px-4 py-3 rounded-lg border border-transparent focus:border-primary focus:ring-0 font-body text-sm text-on-surface transition-all placeholder:text-outline-variant"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {/* Submit Button - Electric Lime */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>Sign In to Dashboard</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
          
          {/* Register Link */}
          <p className="mt-6 text-center text-sm font-body text-on-surface-variant">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:opacity-80 transition-opacity">
              Registrarse
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}