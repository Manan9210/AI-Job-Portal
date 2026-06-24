import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, profile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(email, password)
      showToast('Welcome back! 🎉', 'success')
      // Small delay to let profile load
      setTimeout(() => {
        const role = profile?.role
        navigate(role === 'employer' ? '/dashboard/employer' : '/dashboard/seeker')
      }, 300)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)', top: '-10%', left: '-10%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent)', bottom: '0%', right: '0%', filter: 'blur(60px)' }} />
      </div>

      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-logo">
          <span>🚀</span> <span className="gradient-text">NexusJobs</span>
        </div>
        <p className="auth-subtitle">Welcome back! Sign in to your account</p>

        {error && (
          <div className="alert alert-error mb-4">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email address</label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px' }}
          >
            {loading ? (
              <span className="flex-center gap-3">
                <span className="loading-spinner sm" /> Signing in...
              </span>
            ) : 'Sign In →'}
          </button>
        </form>

        <div className="divider mt-4">or</div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
