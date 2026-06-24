import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { analyzeResume, getMatchScore, generateCoverLetter, generateJobDescription } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

function ScoreRing({ score, size = 140 }) {
  const r = size * 0.4, circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dasharray 1.2s ease' }}/>
        </svg>
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
          <span style={{ fontSize: size*0.2, fontWeight:900, color }}>{score}%</span>
          <span style={{ fontSize:11,color:'var(--text-muted)' }}>score</span>
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className="copy-btn" onClick={copy}>
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  )
}

const TABS = [
  { id: 'resume',   label: '📄 Resume Analyzer',     desc: 'AI-powered resume analysis & ATS scoring' },
  { id: 'match',    label: '🎯 Job Matcher',          desc: 'Get AI match score for any job' },
  { id: 'cover',    label: '✉️ Cover Letter',         desc: 'Generate personalized cover letters' },
  { id: 'jobdesc',  label: '📝 Job Description',      desc: 'AI job description generator' },
]

export default function AITools() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [tab, setTab] = useState('resume')
  const [loading, setLoading] = useState(false)

  // Resume Analyzer state
  const [resumeText, setResumeText] = useState('')
  const [resumeResult, setResumeResult] = useState(null)

  // Job Matcher state
  const [matchForm, setMatchForm] = useState({ jobTitle:'', jobDescription:'', resumeText:'' })
  const [matchResult, setMatchResult] = useState(null)

  // Cover Letter state
  const [coverForm, setCoverForm] = useState({ candidateName:'', jobTitle:'', companyName:'', jobDescription:'', skills:'' })
  const [coverResult, setCoverResult] = useState('')

  // Job Description state
  const [jdForm, setJdForm] = useState({ jobTitle:'', companyName:'', requirements:'', experience:'mid' })
  const [jdResult, setJdResult] = useState('')

  const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token
  }

  const handleResumeAnalyze = async () => {
    if (resumeText.trim().length < 50) { showToast('Please paste your resume text (min 50 chars).', 'warning'); return }
    setLoading(true); setResumeResult(null)
    try {
      const token = await getToken()
      const res = await analyzeResume(resumeText, token)
      setResumeResult(res.data.data)
      showToast('Resume analyzed! ✅', 'success')
    } catch (err) {
      showToast('Analysis failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setLoading(false) }
  }

  const handleMatchScore = async () => {
    if (!matchForm.jobTitle || !matchForm.jobDescription || !matchForm.resumeText) {
      showToast('All fields are required.', 'warning'); return
    }
    setLoading(true); setMatchResult(null)
    try {
      const token = await getToken()
      const res = await getMatchScore(matchForm, token)
      setMatchResult(res.data.data)
      showToast('Match score ready! 🎯', 'success')
    } catch (err) {
      showToast('Match score failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setLoading(false) }
  }

  const handleCoverLetter = async () => {
    if (!coverForm.candidateName || !coverForm.jobTitle || !coverForm.companyName) {
      showToast('Name, job title and company are required.', 'warning'); return
    }
    setLoading(true); setCoverResult('')
    try {
      const token = await getToken()
      const res = await generateCoverLetter(coverForm, token)
      setCoverResult(res.data.data.coverLetter)
      showToast('Cover letter generated! ✉️', 'success')
    } catch (err) {
      showToast('Generation failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setLoading(false) }
  }

  const handleJobDesc = async () => {
    if (!jdForm.jobTitle || !jdForm.companyName) { showToast('Job title and company are required.', 'warning'); return }
    setLoading(true); setJdResult('')
    try {
      const token = await getToken()
      const res = await generateJobDescription(jdForm, token)
      setJdResult(res.data.data.jobDescription)
      showToast('Job description generated! 📝', 'success')
    } catch (err) {
      showToast('Generation failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-wrapper">
      <div className="container ai-tools-page">
        {/* Header */}
        <div className="page-header">
          <h1 className="section-title">🤖 AI <span className="gradient-text">Power Tools</span></h1>
          <p className="section-subtitle">Powered by Google Gemini AI — Your competitive career advantage</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── RESUME ANALYZER ── */}
        {tab === 'resume' && (
          <div className="animate-fade">
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div>
                <div className="card mb-4" style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(59,130,246,0.06))', borderColor:'rgba(124,58,237,0.2)' }}>
                  <h3 style={{ fontWeight:700, marginBottom:8 }}>📄 Resume Analyzer</h3>
                  <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:16 }}>
                    Get instant AI feedback on your resume — ATS compatibility, strengths, weaknesses, and actionable improvements.
                  </p>
                  <div className="form-group">
                    <label className="label">Paste Your Resume Text</label>
                    <textarea className="input-field" rows={12} placeholder="Paste your full resume content here...&#10;&#10;Include your work experience, skills, education, and any other sections." value={resumeText} onChange={e => setResumeText(e.target.value)} />
                  </div>
                  <button className="btn-primary w-full" onClick={handleResumeAnalyze} disabled={loading} style={{ width:'100%' }}>
                    {loading ? <span className="flex-center gap-2"><span className="loading-spinner sm"/>Analyzing with Gemini AI...</span> : '🔍 Analyze Resume'}
                  </button>
                </div>
              </div>

              {/* Results */}
              {resumeResult && (
                <div className="animate-fade">
                  <div className="card mb-4" style={{ textAlign:'center', background:'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.08))' }}>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>OVERALL SCORE</p>
                    <ScoreRing score={resumeResult.overallScore} />
                    <div className="flex-between mt-4 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
                      <div style={{ textAlign:'center' }}>
                        <p style={{ fontSize:22,fontWeight:800,color:'var(--cyan)' }}>{resumeResult.atsScore}%</p>
                        <p style={{ fontSize:12,color:'var(--text-muted)' }}>ATS Score</p>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <p style={{ fontSize:22,fontWeight:800,color:'var(--green)' }}>{resumeResult.strengths?.length}</p>
                        <p style={{ fontSize:12,color:'var(--text-muted)' }}>Strengths</p>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <p style={{ fontSize:22,fontWeight:800,color:'var(--yellow)' }}>{resumeResult.suggestions?.length}</p>
                        <p style={{ fontSize:12,color:'var(--text-muted)' }}>Suggestions</p>
                      </div>
                    </div>
                  </div>

                  {resumeResult.summary && (
                    <div className="alert alert-info mb-4">{resumeResult.summary}</div>
                  )}

                  <div className="card mb-4">
                    <h4 style={{ fontWeight:700, color:'var(--green)', marginBottom:12 }}>✅ Strengths</h4>
                    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                      {resumeResult.strengths?.map((s,i) => (
                        <li key={i} style={{ fontSize:14, color:'var(--text-secondary)', paddingLeft:20, position:'relative' }}>
                          <span style={{ position:'absolute', left:0, color:'var(--green)' }}>•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card mb-4">
                    <h4 style={{ fontWeight:700, color:'var(--red)', marginBottom:12 }}>⚠️ Weaknesses</h4>
                    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                      {resumeResult.weaknesses?.map((w,i) => (
                        <li key={i} style={{ fontSize:14, color:'var(--text-secondary)', paddingLeft:20, position:'relative' }}>
                          <span style={{ position:'absolute', left:0, color:'var(--red)' }}>•</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card mb-4">
                    <h4 style={{ fontWeight:700, color:'var(--purple-light)', marginBottom:12 }}>💡 Suggestions</h4>
                    <ol style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
                      {resumeResult.suggestions?.map((s,i) => (
                        <li key={i} style={{ fontSize:14, color:'var(--text-secondary)', display:'flex', gap:10 }}>
                          <span style={{ background:'var(--gradient)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontWeight:700, flexShrink:0 }}>{i+1}.</span>{s}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {resumeResult.missingKeywords?.length > 0 && (
                    <div className="card">
                      <h4 style={{ fontWeight:700, color:'var(--yellow)', marginBottom:12 }}>🔑 Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeResult.missingKeywords.map(k => <span key={k} className="badge badge-yellow">{k}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!resumeResult && !loading && (
                <div className="empty-state card" style={{ opacity:0.6 }}>
                  <span className="empty-icon">🤖</span>
                  <h3>Ready to Analyze</h3>
                  <p>Paste your resume and click Analyze Resume to get instant AI feedback</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── JOB MATCHER ── */}
        {tab === 'match' && (
          <div className="animate-fade">
            <div className="grid-2" style={{ alignItems:'start' }}>
              <div className="card" style={{ background:'linear-gradient(135deg,rgba(59,130,246,0.06),rgba(6,182,212,0.06))', borderColor:'rgba(59,130,246,0.2)' }}>
                <h3 style={{ fontWeight:700, marginBottom:16 }}>🎯 Job Match Score</h3>
                <div className="form-group">
                  <label className="label">Job Title</label>
                  <input type="text" className="input-field" placeholder="e.g. Senior Frontend Developer" value={matchForm.jobTitle} onChange={e=>setMatchForm(f=>({...f,jobTitle:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Job Description</label>
                  <textarea className="input-field" rows={6} placeholder="Paste the full job description here..." value={matchForm.jobDescription} onChange={e=>setMatchForm(f=>({...f,jobDescription:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Your Resume</label>
                  <textarea className="input-field" rows={6} placeholder="Paste your resume content here..." value={matchForm.resumeText} onChange={e=>setMatchForm(f=>({...f,resumeText:e.target.value}))} />
                </div>
                <button className="btn-primary w-full" onClick={handleMatchScore} disabled={loading} style={{ width:'100%' }}>
                  {loading ? <span className="flex-center gap-2"><span className="loading-spinner sm"/>Calculating...</span> : '🎯 Get Match Score'}
                </button>
              </div>

              {matchResult ? (
                <div className="animate-fade">
                  <div className="card mb-4" style={{ textAlign:'center' }}>
                    <ScoreRing score={matchResult.matchScore} />
                    {matchResult.fitLevel && <p style={{ fontWeight:700, marginTop:12, fontSize:16 }}>{matchResult.fitLevel}</p>}
                  </div>
                  <div className="card mb-4">
                    <h4 style={{ fontWeight:700, color:'var(--green)', marginBottom:10 }}>✅ Matched Skills</h4>
                    <div className="flex flex-wrap gap-2">{matchResult.matchedSkills?.map(s=><span key={s} className="badge badge-green">{s}</span>)}</div>
                  </div>
                  <div className="card mb-4">
                    <h4 style={{ fontWeight:700, color:'var(--red)', marginBottom:10 }}>❌ Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">{matchResult.missingSkills?.map(s=><span key={s} className="badge badge-red">{s}</span>)}</div>
                  </div>
                  {matchResult.keyInsights?.length > 0 && (
                    <div className="card mb-4">
                      <h4 style={{ fontWeight:700, marginBottom:10 }}>💡 Key Insights</h4>
                      <ul style={{ display:'flex', flexDirection:'column', gap:8, listStyle:'none' }}>
                        {matchResult.keyInsights.map((insight,i) => (
                          <li key={i} style={{ fontSize:14, color:'var(--text-secondary)', paddingLeft:20, position:'relative' }}>
                            <span style={{ position:'absolute', left:0 }}>→</span>{insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {matchResult.recommendation && (
                    <div className="alert alert-info">{matchResult.recommendation}</div>
                  )}
                </div>
              ) : (
                <div className="empty-state card" style={{ opacity:0.6 }}>
                  <span className="empty-icon">🎯</span>
                  <h3>Match Score</h3>
                  <p>Fill in the job details and your resume to get an AI-powered match score</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COVER LETTER ── */}
        {tab === 'cover' && (
          <div className="animate-fade">
            <div className="grid-2" style={{ alignItems:'start' }}>
              <div className="card" style={{ background:'linear-gradient(135deg,rgba(236,72,153,0.06),rgba(124,58,237,0.06))', borderColor:'rgba(236,72,153,0.2)' }}>
                <h3 style={{ fontWeight:700, marginBottom:16 }}>✉️ Cover Letter Generator</h3>
                {[
                  ['candidateName','Your Full Name','John Doe'],
                  ['jobTitle','Job Title','Senior React Developer'],
                  ['companyName','Company Name','Acme Corp'],
                  ['skills','Your Key Skills','React, Node.js, TypeScript, AWS'],
                ].map(([key,lbl,ph]) => (
                  <div key={key} className="form-group">
                    <label className="label">{lbl}</label>
                    <input type="text" className="input-field" placeholder={ph} value={coverForm[key]} onChange={e=>setCoverForm(f=>({...f,[key]:e.target.value}))} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="label">Job Description (optional)</label>
                  <textarea className="input-field" rows={5} placeholder="Paste the job description for a more tailored letter..." value={coverForm.jobDescription} onChange={e=>setCoverForm(f=>({...f,jobDescription:e.target.value}))} />
                </div>
                <button className="btn-primary w-full" onClick={handleCoverLetter} disabled={loading} style={{ width:'100%' }}>
                  {loading ? <span className="flex-center gap-2"><span className="loading-spinner sm"/>Generating...</span> : '✉️ Generate Cover Letter'}
                </button>
              </div>

              {coverResult ? (
                <div className="animate-fade">
                  <div className="card">
                    <div className="flex-between mb-3">
                      <h4 style={{ fontWeight:700 }}>Generated Cover Letter</h4>
                      <CopyButton text={coverResult} />
                    </div>
                    <div className="ai-output-text">{coverResult}</div>
                    <button className="btn-secondary btn-sm mt-4" onClick={() => setCoverResult('')}>Generate Another</button>
                  </div>
                </div>
              ) : (
                <div className="empty-state card" style={{ opacity:0.6 }}>
                  <span className="empty-icon">✉️</span>
                  <h3>Cover Letter</h3>
                  <p>Fill in your details to generate a personalized, professional cover letter</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── JOB DESCRIPTION ── */}
        {tab === 'jobdesc' && (
          <div className="animate-fade">
            <div className="grid-2" style={{ alignItems:'start' }}>
              <div className="card" style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(6,182,212,0.06))', borderColor:'rgba(16,185,129,0.2)' }}>
                <h3 style={{ fontWeight:700, marginBottom:16 }}>📝 Job Description Generator</h3>
                {[
                  ['jobTitle','Job Title','e.g. Senior Backend Engineer'],
                  ['companyName','Company Name','e.g. TechCorp Inc.'],
                  ['requirements','Key Requirements','e.g. 5+ years Node.js, REST APIs, PostgreSQL'],
                ].map(([key,lbl,ph]) => (
                  <div key={key} className="form-group">
                    <label className="label">{lbl}</label>
                    {key === 'requirements' ? (
                      <textarea className="input-field" rows={4} placeholder={ph} value={jdForm[key]} onChange={e=>setJdForm(f=>({...f,[key]:e.target.value}))} />
                    ) : (
                      <input type="text" className="input-field" placeholder={ph} value={jdForm[key]} onChange={e=>setJdForm(f=>({...f,[key]:e.target.value}))} />
                    )}
                  </div>
                ))}
                <div className="form-group">
                  <label className="label">Experience Level</label>
                  <select className="input-field" value={jdForm.experience} onChange={e=>setJdForm(f=>({...f,experience:e.target.value}))}>
                    {['entry','mid','senior','lead','executive'].map(e=><option key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>)}
                  </select>
                </div>
                <button className="btn-primary w-full" onClick={handleJobDesc} disabled={loading} style={{ width:'100%' }}>
                  {loading ? <span className="flex-center gap-2"><span className="loading-spinner sm"/>Generating...</span> : '📝 Generate Job Description'}
                </button>
              </div>

              {jdResult ? (
                <div className="animate-fade">
                  <div className="card">
                    <div className="flex-between mb-3">
                      <h4 style={{ fontWeight:700 }}>Generated Job Description</h4>
                      <CopyButton text={jdResult} />
                    </div>
                    <div className="ai-output-text">{jdResult}</div>
                    <button className="btn-secondary btn-sm mt-4" onClick={() => setJdResult('')}>Generate Another</button>
                  </div>
                </div>
              ) : (
                <div className="empty-state card" style={{ opacity:0.6 }}>
                  <span className="empty-icon">📝</span>
                  <h3>Job Description</h3>
                  <p>Enter your job details to generate a complete, professional job description</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
