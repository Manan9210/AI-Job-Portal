import { Link } from 'react-router-dom'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     badge: 'badge-yellow', border: 'var(--yellow)', icon: '⏳' },
  reviewing:   { label: 'Reviewing',   badge: 'badge-blue',   border: 'var(--blue)',   icon: '🔍' },
  shortlisted: { label: 'Shortlisted', badge: 'badge-purple', border: 'var(--purple)', icon: '⭐' },
  rejected:    { label: 'Rejected',    badge: 'badge-red',    border: 'var(--red)',    icon: '❌' },
  hired:       { label: 'Hired! 🎉',   badge: 'badge-green',  border: 'var(--green)',  icon: '✅' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days / 7)}w ago`
}

function ScoreMini({ score }) {
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${(score / 100) * 87.96} 87.96`} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}%</span>
    </div>
  )
}

export default function ApplicationCard({ application }) {
  const job = application.jobs || {}
  const status = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending
  const salary = job.salary_min ? `$${Number(job.salary_min).toLocaleString()}+` : null

  return (
    <div className="card animate-fade" style={{ borderLeft: `3px solid ${status.border}`, transition: 'all 0.3s' }}>
      <div className="flex-between gap-4" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{job.title || 'Job Title'}</h3>
            <span className={`badge ${status.badge}`}>{status.icon} {status.label}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {job.company || 'Company'}
            {job.location ? ` · 📍 ${job.location}` : ''}
            {salary ? ` · 💰 ${salary}` : ''}
          </p>
          <div className="flex gap-3 flex-wrap">
            {job.job_type && <span className="badge badge-blue">{job.job_type}</span>}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Applied {timeAgo(application.created_at)}</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3" style={{ flexShrink: 0 }}>
          {application.ai_match_score != null && (
            <div style={{ textAlign: 'center' }}>
              <ScoreMini score={application.ai_match_score} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>AI Match</p>
            </div>
          )}
          <Link to={`/jobs/${application.job_id}`} className="btn-secondary btn-sm">View Job</Link>
        </div>
      </div>
      {application.cover_letter && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover Letter</span>
          <p style={{ marginTop: 4 }}>{application.cover_letter.slice(0, 200)}{application.cover_letter.length > 200 ? '...' : ''}</p>
        </div>
      )}
    </div>
  )
}
