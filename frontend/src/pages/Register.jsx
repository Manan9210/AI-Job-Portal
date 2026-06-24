import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'seeker', companyName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.role === 'employer' && !form.companyName) { setError('Please enter your company name.'); return }
    setLoading(true)
    try {
      await register(form.email, form.password, form.fullName, form.role, form.companyName || null)
      showToast('Account created! Welcome to NexusJobs 🚀', 'success')
      navigate(form.role === 'employer' ? '/dashboard/employer' : '/dashboard/seeker')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)', top: '-10%', right: '-10%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent)', bottom: '0%', left: '0%', filter: 'blur(60px)' }} />
      </div>

      <div className="auth-card" style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
        <div className="auth-logo">🚀 <span className="gradient-text">NexusJobs</span></div>
        <p className="auth-subtitle">Create your free account and get started</p>

        {error && <div className="alert alert-error mb-4"><span>⚠️</span> {error}</div>}

        {/* Role Toggle */}
        <div className="form-group">
          <label className="label">I am a...</label>
          <div className="role-toggle">
            <button type="button" id="role-seeker" className={`role-btn${form.role === 'seeker' ? ' active' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'seeker' }))}>
              👤 Job Seeker
            </button>
            <button type="button" id="role-employer" className={`role-btn${form.role === 'employer' ? ' active' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'employer' }))}>
              🏢 Employer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input id="reg-name" type="text" className="input-field" placeholder="John Doe" value={form.fullName} onChange={set('fullName')} required />
          </div>
          <div className="form-group">
            <label className="label">Email address</label>
            <input id="reg-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input id="reg-password" type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          {form.role === 'employer' && (
            <div className="form-group animate-fade">
              <label className="label">Company Name</label>
              <input id="reg-company" type="text" className="input-field" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} required />
            </div>
          )}

          <button
            id="reg-submit"
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: 8 }}
          >
            {loading ? <span className="flex-center gap-3"><span className="loading-spinner sm" /> Creating account...</span> : 'Create Account →'}
          </button>
        </form>

        <div className="divider mt-4">already have an account?</div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--purple-light)', fontWeight: 600, fontSize: 14 }}>Sign in →</Link>
        </div>
      </div>
    </div>
  )
}
