import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Loader from '../components/Loader'

const STATUS_CONFIG = {
  pending:     { label:'Pending',     badge:'badge-yellow' },
  reviewing:   { label:'Reviewing',   badge:'badge-blue'   },
  shortlisted: { label:'Shortlisted', badge:'badge-purple' },
  rejected:    { label:'Rejected',    badge:'badge-red'    },
  hired:       { label:'Hired',       badge:'badge-green'  },
}

export default function EmployerDashboard() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [tab, setTab] = useState('jobs')

  useEffect(() => { if (user) { fetchJobs(); fetchRecentApps() } }, [user])

  const fetchJobs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  const fetchRecentApps = async () => {
    const { data: myJobs } = await supabase.from('jobs').select('id').eq('employer_id', user.id)
    if (!myJobs?.length) return
    const jobIds = myJobs.map(j => j.id)
    const { data } = await supabase
      .from('applications')
      .select('*, jobs(title,company), profiles(full_name,email)')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })
      .limit(10)
    setRecentApps(data || [])
  }

  const toggleJobStatus = async (jobId, current) => {
    const { error } = await supabase.from('jobs').update({ is_active: !current }).eq('id', jobId)
    if (!error) {
      setJobs(js => js.map(j => j.id === jobId ? { ...j, is_active: !current } : j))
      showToast(`Job ${!current ? 'activated' : 'paused'}.`, 'success')
    }
  }

  const deleteJob = async (jobId) => {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (!error) {
      setJobs(js => js.filter(j => j.id !== jobId))
      showToast('Job deleted.', 'success')
    } else {
      showToast('Delete failed: ' + error.message, 'error')
    }
    setConfirmDelete(null)
  }

  const updateAppStatus = async (appId, status) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId)
    if (!error) {
      setRecentApps(apps => apps.map(a => a.id === appId ? { ...a, status } : a))
      showToast(`Status updated to ${status}.`, 'success')
    }
  }

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.is_active).length,
    totalApps: recentApps.length,
    hired: recentApps.filter(a => a.status === 'hired').length,
  }

  if (loading) return <Loader fullPage />

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="section-title">
                <span className="gradient-text">{profile?.company_name || 'Employer'}</span> Dashboard
              </h1>
              <p className="section-subtitle">Manage your job postings and review applications</p>
            </div>
            <div className="flex gap-3">
              <Link to="/post-job" className="btn-primary">+ Post New Job</Link>
              <Link to="/ai-tools" className="btn-secondary">🤖 AI Tools</Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats mb-8">
          {[
            { icon:'📋', label:'Jobs Posted',   value: stats.totalJobs,  color:'var(--purple)' },
            { icon:'✅', label:'Active Jobs',    value: stats.activeJobs, color:'var(--green)'  },
            { icon:'👥', label:'Applications',   value: stats.totalApps,  color:'var(--blue)'   },
            { icon:'🎉', label:'Hired',          value: stats.hired,      color:'var(--yellow)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <div className="stat-value" style={{ background:`linear-gradient(135deg,${s.color},${s.color}99)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-nav">
          <button className={`tab-btn${tab==='jobs'?' active':''}`} onClick={() => setTab('jobs')}>📋 My Jobs</button>
          <button className={`tab-btn${tab==='apps'?' active':''}`} onClick={() => setTab('apps')}>👥 Applications</button>
        </div>

        {/* Jobs Tab */}
        {tab === 'jobs' && (
          <div className="animate-fade">
            {jobs.length === 0 ? (
              <div className="empty-state card">
                <span className="empty-icon">📭</span>
                <h3>No jobs posted yet</h3>
                <p>Create your first job listing to start receiving applications</p>
                <Link to="/post-job" className="btn-primary mt-4">Post a Job →</Link>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="jobs-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Type</th>
                        <th>Applications</th>
                        <th>Status</th>
                        <th>Posted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id}>
                          <td>
                            <div>
                              <p style={{ fontWeight: 600 }}>{job.title}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.location || 'Remote'}</p>
                            </div>
                          </td>
                          <td><span className="badge badge-blue">{job.job_type}</span></td>
                          <td>
                            <span className="badge badge-purple">
                              {job.applications?.[0]?.count || 0} apps
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${job.is_active ? 'badge-green' : 'badge-red'}`}>
                              {job.is_active ? '● Active' : '○ Paused'}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {new Date(job.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn-secondary btn-sm" onClick={() => navigate(`/jobs/${job.id}`)}>View</button>
                              <button className="btn-secondary btn-sm" onClick={() => toggleJobStatus(job.id, job.is_active)}>
                                {job.is_active ? 'Pause' : 'Activate'}
                              </button>
                              <button className="btn-danger" onClick={() => setConfirmDelete(job.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {tab === 'apps' && (
          <div className="animate-fade">
            {recentApps.length === 0 ? (
              <div className="empty-state card">
                <span className="empty-icon">📬</span>
                <h3>No applications yet</h3>
                <p>Applications will appear here once candidates apply to your jobs</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recentApps.map(app => (
                  <div key={app.id} className="card animate-fade">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16 }}>{app.profiles?.full_name || 'Candidate'}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                          Applied for: <strong>{app.jobs?.title}</strong> · {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        {app.profiles?.email && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>📧 {app.profiles.email}</p>}
                        {app.cover_letter && (
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                            {app.cover_letter.slice(0, 150)}{app.cover_letter.length > 150 ? '...' : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-3" style={{ flexShrink: 0 }}>
                        <span className={`badge ${STATUS_CONFIG[app.status]?.badge || 'badge-yellow'}`}>
                          {STATUS_CONFIG[app.status]?.label || app.status}
                        </span>
                        {app.ai_match_score != null && (
                          <span className="badge badge-purple">🤖 {app.ai_match_score}% match</span>
                        )}
                        <select
                          className="input-field"
                          value={app.status}
                          onChange={e => updateAppStatus(app.id, e.target.value)}
                          style={{ fontSize: 12, padding: '6px 10px' }}
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setConfirmDelete(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: 48 }}>⚠️</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '16px 0 8px' }}>Delete Job?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                This will permanently delete the job and all its applications. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="btn-danger flex-1" style={{ flex: 1, padding: '10px 20px' }} onClick={() => deleteJob(confirmDelete)}>Delete Job</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
