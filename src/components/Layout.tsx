import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Search,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  User,
  Building2
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'seller'] },
  { path: '/products', label: 'Productos', icon: Package, roles: ['super_admin', 'admin', 'seller'] },
  { path: '/sales', label: 'Ventas', icon: ShoppingCart, roles: ['super_admin', 'admin', 'seller'] },
  { path: '/users', label: 'Usuarios', icon: Users, roles: ['super_admin', 'admin'] },
  { path: '/stores', label: 'Tiendas', icon: Building2, roles: ['super_admin'] },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredNav = navItems.filter(
    (item) => !item.roles || (user && item.roles.some((r) => r === user.role || (r === 'admin' && isAdmin)))
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-60 bg-surface-container-low transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-outline-variant">
            <Link to="/dashboard" className="font-headline font-extrabold text-xl text-primary">
              SaaS Ventas
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors",
                  location.pathname.startsWith(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Sidebar Footer - User Info & Logout */}
          <div className="p-4 border-t border-outline-variant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-headline font-bold text-on-primary">{getUserInitial()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-on-surface truncate">{user?.name}</p>
                <p className="text-xs font-body text-on-surface-variant capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-body text-tertiary hover:bg-error-container transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-surface-container-low flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Left: Hamburger & Search */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-container"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 bg-surface-container rounded-lg text-sm font-body text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Right: Icons & User */}
          <div className="flex items-center gap-2">
            {/* Search Button (mobile) */}
            <button className="sm:hidden p-2 rounded-lg hover:bg-surface-container">
              <Search className="w-5 h-5" />
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-surface-container">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-tertiary rounded-full"></span>
            </button>
            
            {/* Settings / Profile */}
            <Link to="/profile" className="p-2 rounded-lg hover:bg-surface-container">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}