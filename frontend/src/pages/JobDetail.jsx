import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getMatchScore } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Loader from '../components/Loader'

const STATUS_BADGE = { 'full-time':'badge-green','part-time':'badge-blue','remote':'badge-purple','contract':'badge-yellow','internship':'badge-pink' }

function ScoreRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : 'var(--red)'
  const label = score >= 70 ? 'Excellent Fit' : score >= 40 ? 'Good Fit' : 'Weak Fit'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
          <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 65 65)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
        </svg>
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
          <span style={{ fontSize:28,fontWeight:900,color }}>{score}%</span>
          <span style={{ fontSize:11,color:'var(--text-muted)' }}>match</span>
        </div>
      </div>
      <p style={{ fontSize:13,fontWeight:600,color,marginTop:8 }}>{label}</p>
    </div>
  )
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '')
  const [tab, setTab] = useState('overview')
  // AI match
  const [matchScore, setMatchScore] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [showMatchModal, setShowMatchModal] = useState(false)

  useEffect(() => { fetchJob() }, [id])

  const fetchJob = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('jobs').select('*, profiles(full_name, company_name, company_description, company_website, avatar_url)')
      .eq('id', id).single()
    setJob(data)

    if (user && profile?.role === 'seeker') {
      const { data: app } = await supabase.from('applications')
        .select('id').eq('job_id', id).eq('applicant_id', user.id).single()
      setAlreadyApplied(!!app)
    }
    setLoading(false)
  }

  const handleApply = async () => {
    if (!coverLetter.trim()) { showToast('Please write a cover letter.', 'warning'); return }
    setApplying(true)
    try {
      const { error } = await supabase.from('applications').insert({
        job_id: id, applicant_id: user.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl || profile?.resume_url || '',
        status: 'pending',
        ai_match_score: matchScore,
      })
      if (error) throw error
      setAlreadyApplied(true)
      setShowModal(false)
      showToast('Application submitted! ✅', 'success')
    } catch (err) {
      showToast(err.message || 'Application failed.', 'error')
    } finally { setApplying(false) }
  }

  const handleMatchScore = async () => {
    if (!resumeText.trim()) { showToast('Please paste your resume text.', 'warning'); return }
    setMatchLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const res = await getMatchScore({ jobTitle: job.title, jobDescription: job.description, resumeText }, token)
      setMatchData(res.data.data)
      setMatchScore(res.data.data.matchScore)
    } catch (err) {
      showToast('Match score failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setMatchLoading(false) }
  }

  if (loading) return <Loader fullPage />
  if (!job) return (
    <div className="page-wrapper flex-center" style={{ minHeight: '80vh' }}>
      <div className="empty-state">
        <span className="empty-icon">🔍</span>
        <h3>Job not found</h3>
        <button className="btn-primary mt-4" onClick={() => navigate('/jobs')}>Browse Jobs</button>
      </div>
    </div>
  )

  const salary = job.salary_min
    ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max || job.salary_min).toLocaleString()}/yr`
    : null
  const employer = job.profiles

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <button className="btn-secondary btn-sm mb-6" onClick={() => navigate('/jobs')}>← Back to Jobs</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            {/* Job Header Card */}
            <div className="card mb-4" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div className="flex gap-4 items-center mb-4" style={{ flexWrap: 'wrap' }}>
                <div style={{ width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,#7C3AED,#3B82F6)', display:'flex',alignItems:'center',justifyContent:'center', fontSize:28, fontWeight:800, color:'white', flexShrink:0 }}>
                  {(job.company||'?')[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight:900, marginBottom:6 }}>{job.title}</h1>
                  <div className="flex gap-3 flex-wrap items-center">
                    <span style={{ fontWeight:600, color:'var(--text-secondary)' }}>{job.company}</span>
                    {job.location && <span style={{ color:'var(--text-muted)',fontSize:14 }}>📍 {job.location}</span>}
                    {job.application_deadline && <span style={{ color:'var(--text-muted)',fontSize:13 }}>⏰ Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {job.job_type && <span className={`badge ${STATUS_BADGE[job.job_type]||'badge-blue'}`}>{job.job_type}</span>}
                {job.experience_level && <span className="badge badge-cyan">{job.experience_level}</span>}
                {job.category && <span className="badge badge-purple">{job.category}</span>}
                {salary && <span className="badge badge-green">💰 {salary}</span>}
              </div>
              {/* Skills */}
              {job.skills_required?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {job.skills_required.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="tab-nav">
              {['overview','requirements','company'].map(t => (
                <button key={t} className={`tab-btn${tab===t?' active':''}`} onClick={() => setTab(t)}>
                  {t==='overview'?'📋':t==='requirements'?'✅':'🏢'} {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="card animate-fade">
                <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>Job Overview</h2>
                <div style={{ whiteSpace:'pre-wrap', lineHeight:1.8, color:'var(--text-secondary)', fontSize:14 }}>{job.description}</div>
                {job.responsibilities && (
                  <div style={{ marginTop:24 }}>
                    <h3 style={{ fontSize:16,fontWeight:700,marginBottom:12 }}>Key Responsibilities</h3>
                    <div style={{ whiteSpace:'pre-wrap', lineHeight:1.8, color:'var(--text-secondary)', fontSize:14 }}>{job.responsibilities}</div>
                  </div>
                )}
              </div>
            )}
            {tab === 'requirements' && (
              <div className="card animate-fade">
                <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>Requirements</h2>
                <div style={{ whiteSpace:'pre-wrap', lineHeight:1.8, color:'var(--text-secondary)', fontSize:14 }}>
                  {job.requirements || 'No specific requirements listed.'}
                </div>
              </div>
            )}
            {tab === 'company' && (
              <div className="card animate-fade">
                <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>About {job.company}</h2>
                <p style={{ color:'var(--text-secondary)', lineHeight:1.8, fontSize:14 }}>
                  {employer?.company_description || `${job.company} is a dynamic company looking for talented professionals to join their team.`}
                </p>
                {employer?.company_website && (
                  <a href={employer.company_website} target="_blank" rel="noreferrer" className="btn-secondary btn-sm mt-4" style={{ display:'inline-flex' }}>
                    🌐 Visit Website
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Apply Card */}
            <div className="card" style={{ position:'sticky', top:90 }}>
              {profile?.role === 'seeker' ? (
                <>
                  {alreadyApplied ? (
                    <div className="alert alert-success">✅ You've already applied to this job!</div>
                  ) : (
                    <button className="btn-primary w-full" onClick={() => setShowModal(true)} style={{ width:'100%', padding:14, fontSize:15 }}>
                      Apply Now →
                    </button>
                  )}
                  <button className="btn-secondary w-full mt-3" onClick={() => setShowMatchModal(true)} style={{ width:'100%' }}>
                    🤖 Check AI Match Score
                  </button>
                </>
              ) : (
                <div className="alert alert-info">👋 Logged in as Employer</div>
              )}

              {matchScore !== null && (
                <div style={{ marginTop:20, textAlign:'center', padding:'16px 0', borderTop:'1px solid var(--border)' }}>
                  <ScoreRing score={matchScore} />
                </div>
              )}

              <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['📅','Posted', new Date(job.created_at).toLocaleDateString()],
                  ['💼','Type', job.job_type],
                  ['📍','Location', job.location || 'Not specified'],
                  ['🎓','Experience', job.experience_level],
                  ['💰','Salary', salary || 'Not disclosed'],
                ].map(([icon,lbl,val]) => val && (
                  <div key={lbl} className="flex-between" style={{ fontSize:13 }}>
                    <span style={{ color:'var(--text-muted)' }}>{icon} {lbl}</span>
                    <span style={{ fontWeight:500 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize:20,fontWeight:700 }}>Apply to {job.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="label">Resume URL (optional)</label>
              <input type="url" className="input-field" placeholder="https://..." value={resumeUrl} onChange={e=>setResumeUrl(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Cover Letter *</label>
              <textarea className="input-field" rows={6} placeholder="Tell us why you're a great fit for this role..." value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={handleApply} disabled={applying}>
                {applying ? <span className="flex-center gap-2"><span className="loading-spinner sm"/>Submitting...</span> : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Score Modal */}
      {showMatchModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setShowMatchModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize:20,fontWeight:700 }}>🤖 AI Match Score</h2>
              <button className="modal-close" onClick={() => setShowMatchModal(false)}>✕</button>
            </div>
            {!matchData ? (
              <>
                <p style={{ fontSize:14,color:'var(--text-secondary)',marginBottom:16 }}>Paste your resume text to get an AI-powered match score for this job.</p>
                <div className="form-group">
                  <label className="label">Your Resume Text</label>
                  <textarea className="input-field" rows={8} placeholder="Paste your resume content here..." value={resumeText} onChange={e=>setResumeText(e.target.value)} />
                </div>
                <button className="btn-primary w-full" onClick={handleMatchScore} disabled={matchLoading} style={{ width:'100%' }}>
                  {matchLoading ? <span className="flex-center gap-2"><span className="loading-spinner sm"/>Analyzing...</span> : 'Get Match Score'}
                </button>
              </>
            ) : (
              <div className="animate-fade">
                <div style={{ textAlign:'center',marginBottom:24 }}><ScoreRing score={matchData.matchScore} /></div>
                {matchData.fitLevel && <p style={{ textAlign:'center',fontWeight:600,marginBottom:16 }}>{matchData.fitLevel}</p>}
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:'var(--text-muted)',marginBottom:8 }}>MATCHED SKILLS</p>
                  <div className="flex flex-wrap gap-2">{matchData.matchedSkills?.map(s=><span key={s} className="badge badge-green">{s}</span>)}</div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:'var(--text-muted)',marginBottom:8 }}>MISSING SKILLS</p>
                  <div className="flex flex-wrap gap-2">{matchData.missingSkills?.map(s=><span key={s} className="badge badge-red">{s}</span>)}</div>
                </div>
                <div className="alert alert-info" style={{ marginBottom:16 }}>{matchData.recommendation}</div>
                <button className="btn-secondary w-full" onClick={() => { setMatchData(null); setResumeText('') }} style={{ width:'100%' }}>Try Again</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
