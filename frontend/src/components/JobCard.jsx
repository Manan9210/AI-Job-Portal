import { useNavigate } from 'react-router-dom'

const JOB_TYPE_BADGE = {
  'full-time':  'badge-green',
  'part-time':  'badge-blue',
  'remote':     'badge-purple',
  'contract':   'badge-yellow',
  'internship': 'badge-pink',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatSalary(min, max) {
  if (!min && !max) return null
  const fmt = (n) => `$${Number(n).toLocaleString()}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}/yr`
  if (min) return `${fmt(min)}+/yr`
  return `Up to ${fmt(max)}/yr`
}

export default function JobCard({ job }) {
  const navigate = useNavigate()
  const skills = job.skills_required || []
  const displaySkills = skills.slice(0, 3)
  const extraSkills = skills.length - displaySkills.length
  const salary = formatSalary(job.salary_min, job.salary_max)
  const letter = (job.company || job.title || '?')[0].toUpperCase()
  const colors = ['#7C3AED','#3B82F6','#EC4899','#10B981','#F59E0B','#06B6D4']
  const color = colors[letter.charCodeAt(0) % colors.length]

  return (
    <div className="card glass-hover animate-fade" onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
      <div className="flex-between gap-4" style={{ flexWrap: 'wrap' }}>
        <div className="flex gap-4 items-center" style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${color}99, ${color}44)`,
            border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: 'white',
          }}>{letter}</div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{job.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {job.company}{job.location ? ` · 📍 ${job.location}` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {job.job_type && <span className={`badge ${JOB_TYPE_BADGE[job.job_type] || 'badge-blue'}`}>{job.job_type}</span>}
          {job.experience_level && <span className="badge badge-cyan">{job.experience_level}</span>}
        </div>
      </div>
      <div className="flex-between gap-3 mt-4" style={{ flexWrap: 'wrap' }}>
        <div className="flex gap-2 flex-wrap">
          {displaySkills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          {extraSkills > 0 && <span className="skill-tag" style={{ background: 'rgba(255,255,255,0.06)' }}>+{extraSkills}</span>}
        </div>
        <div className="flex gap-4 items-center">
          {salary && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{salary}</span>}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(job.created_at)}</span>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <span className="btn-primary btn-sm" style={{ pointerEvents: 'none' }}>View Details →</span>
      </div>
    </div>
  )
}
