import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const dashboardPath = profile?.role === 'employer' ? '/dashboard/employer' : '/dashboard/seeker'
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?'

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} style={{ background: scrolled ? undefined : 'rgba(10,10,15,0.7)' }}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span>🚀</span>
            <span className="gradient-text">NexusJobs</span>
          </Link>
          <div className="navbar-links">
            {user && (
              <>
                <Link to="/jobs" className={isActive('/jobs')}>Browse Jobs</Link>
                <Link to="/ai-tools" className={isActive('/ai-tools')}>🤖 AI Tools</Link>
                <Link to={dashboardPath} className={location.pathname.startsWith('/dashboard') ? 'nav-link active' : 'nav-link'}>Dashboard</Link>
              </>
            )}
          </div>
          <div className="navbar-actions">
            {user ? (
              <>
                <Link to="/profile">
                  <div className="user-avatar" title={profile?.full_name || 'Profile'}>{initials}</div>
                </Link>
                <button className="btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </>
            )}
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {user ? (
          <>
            <Link to="/jobs" className="mobile-nav-link">Browse Jobs</Link>
            <Link to="/ai-tools" className="mobile-nav-link">🤖 AI Tools</Link>
            <Link to={dashboardPath} className="mobile-nav-link">Dashboard</Link>
            <Link to="/profile" className="mobile-nav-link">Profile</Link>
            <button className="mobile-nav-link" onClick={handleLogout} style={{ color: 'var(--red)' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link">Login</Link>
            <Link to="/register" className="mobile-nav-link">Get Started</Link>
          </>
        )}
      </div>
    </>
  )
}
