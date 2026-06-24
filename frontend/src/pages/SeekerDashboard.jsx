import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ApplicationCard from '../components/ApplicationCard'
import Loader from '../components/Loader'

export default function SeekerDashboard() {
  const { user, profile } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchApplications() }, [user])

  const fetchApplications = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('applications')
      .select('*, jobs(id,title,company,location,job_type,salary_min,salary_max)')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    hired: applications.filter(a => a.status === 'hired').length,
  }

  const completeness = (() => {
    if (!profile) return 0
    const fields = ['full_name','bio','location','phone','linkedin_url','github_url','portfolio_url','resume_url']
    const filled = fields.filter(f => profile[f] && profile[f].length > 0).length
    return Math.round((filled / fields.length) * 100)
  })()

  if (loading) return <Loader fullPage />

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="section-title">
                Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'there'}!</span>
              </h1>
              <p className="section-subtitle">Track your job applications and use AI tools to boost your chances</p>
            </div>
            <div className="flex gap-3">
              <Link to="/ai-tools" className="btn-primary">🤖 AI Tools</Link>
              <Link to="/jobs" className="btn-secondary">Browse Jobs</Link>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        {completeness < 100 && (
          <div className="card mb-6" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.08))', borderColor: 'rgba(124,58,237,0.2)' }}>
            <div className="flex-between mb-3">
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Profile Completeness</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Complete your profile to attract more employers</p>
              </div>
              <span className="gradient-text" style={{ fontSize: 28, fontWeight: 900 }}>{completeness}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${completeness}%` }} />
            </div>
            <Link to="/profile" className="btn-secondary btn-sm mt-4" style={{ display: 'inline-flex' }}>Complete Profile →</Link>
          </div>
        )}

        {/* Stats */}
        <div className="dashboard-stats">
          {[
            { icon: '📋', label: 'Total Applied', value: stats.total, color: 'var(--purple)' },
            { icon: '⏳', label: 'Pending', value: stats.pending, color: 'var(--yellow)' },
            { icon: '⭐', label: 'Shortlisted', value: stats.shortlisted, color: 'var(--blue)' },
            { icon: '🎉', label: 'Hired', value: stats.hired, color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <div className="stat-value" style={{ background: `linear-gradient(135deg,${s.color},${s.color}99)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</h2>
          <div className="grid-3" style={{ gap: 12 }}>
            {[
              { icon: '🔍', label: 'Browse Jobs', to: '/jobs', desc: 'Find new opportunities' },
              { icon: '🤖', label: 'AI Resume Check', to: '/ai-tools', desc: 'Analyze your resume' },
              { icon: '👤', label: 'Edit Profile', to: '/profile', desc: 'Update your information' },
            ].map(a => (
              <Link key={a.label} to={a.to} style={{ textDecoration: 'none' }}>
                <div className="card glass-hover" style={{ textAlign: 'center', padding: 20 }}>
                  <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{a.icon}</span>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Applications */}
        <div>
          <div className="flex-between mb-4">
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>My Applications</h2>
            <span className="badge badge-purple">{applications.length} total</span>
          </div>
          {applications.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">📭</span>
              <h3>No applications yet</h3>
              <p>Start applying to jobs and track everything here</p>
              <Link to="/jobs" className="btn-primary mt-4">Browse Jobs →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {applications.map(app => <ApplicationCard key={app.id} application={app} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
