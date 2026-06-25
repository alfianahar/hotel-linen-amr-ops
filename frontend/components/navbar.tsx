import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Library', path: '/library' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Automation', path: '/automation' },
  { label: 'Lift', path: '/lift' },
]

export default function Navbar() {
  const location = useLocation()
  return (
    <header className="h-14 bg-white border-b shrink-0 flex items-center px-4 gap-6">
      <span className="font-bold text-base whitespace-nowrap">Hotel Linen Ops</span>
      <nav className="flex items-center gap-1">
        {tabs.map(t => (
          <NavLink
            key={t.path}
            to={t.path}
            className={({ isActive }) =>
              `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive || (t.path === '/dashboard' && (location.pathname === '/' || location.pathname.startsWith('/dashboard')))
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
