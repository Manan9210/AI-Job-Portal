import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateJobDescription } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const JOB_TYPES = ['full-time','part-time','remote','contract','internship']
const CATEGORIES = ['Technology','Design','Marketing','Finance','Healthcare','Engineering','Data Science','Sales','Operations','Legal','Education','Other']
const EXP_LEVELS = ['entry','mid','senior','lead','executive']
const CURRENCIES = ['USD','EUR','GBP','INR','AUD','CAD']

export default function PostJob() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    title: '', company: profile?.company_name || '', location: '',
    job_type: 'full-time', category: 'Technology', experience_level: 'mid',
    description: '', requirements: '', responsibilities: '',
    salary_min: '', salary_max: '', salary_currency: 'USD',
    skills_required: [], application_deadline: '', is_active: true,
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const addSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const skill = skillInput.trim().replace(/,$/, '')
      if (skill && !form.skills_required.includes(skill)) {
        setForm(f => ({ ...f, skills_required: [...f.skills_required, skill] }))
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => setForm(f => ({ ...f, skills_required: f.skills_required.filter(s => s !== skill) }))

  const handleAIGenerate = async () => {
    if (!form.title || !form.company) { showToast('Please enter job title and company first.', 'warning'); return }
    setAiLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const res = await generateJobDescription({
        jobTitle: form.title,
        companyName: form.company,
        requirements: form.requirements,
        experience: form.experience_level,
      }, token)
      const generated = res.data.data.jobDescription
      setForm(f => ({ ...f, description: generated }))
      showToast('Job description generated! ✨', 'success')
    } catch (err) {
      showToast('AI generation failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setAiLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.company || !form.description) {
      showToast('Title, company and description are required.', 'warning'); return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        employer_id: user.id,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        application_deadline: form.application_deadline || null,
        skills_required: form.skills_required,
      }
      const { error } = await supabase.from('jobs').insert(payload)
      if (error) throw error
      showToast('Job posted successfully! 🎉', 'success')
      navigate('/dashboard/employer')
    } catch (err) {
      showToast('Failed to post job: ' + err.message, 'error')
    } finally { setLoading(false) }
  }

  const Section = ({ title, children }) => (
    <div className="card mb-6">
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>{title}</h2>
      {children}
    </div>
  )

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 860 }}>
        <div className="page-header">
          <h1 className="section-title">Post a <span className="gradient-text">New Job</span></h1>
          <p className="section-subtitle">Fill out the details below. Use AI to generate a professional description instantly.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basics */}
          <Section title="📋 Job Basics">
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Job Title *</label>
                <input id="job-title" type="text" className="input-field" placeholder="e.g. Senior React Developer" value={form.title} onChange={set('title')} required />
              </div>
              <div className="form-group">
                <label className="label">Company Name *</label>
                <input id="job-company" type="text" className="input-field" placeholder="Your company" value={form.company} onChange={set('company')} required />
              </div>
              <div className="form-group">
                <label className="label">Location</label>
                <input id="job-location" type="text" className="input-field" placeholder="e.g. San Francisco, CA or Remote" value={form.location} onChange={set('location')} />
              </div>
              <div className="form-group">
                <label className="label">Job Type</label>
                <select id="job-type" className="input-field" value={form.job_type} onChange={set('job_type')}>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Category</label>
                <select id="job-category" className="input-field" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Experience Level</label>
                <select id="job-exp" className="input-field" value={form.experience_level} onChange={set('experience_level')}>
                  {EXP_LEVELS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </Section>

          {/* Section 2: Description */}
          <Section title="📝 Job Details">
            <div className="form-group">
              <div className="flex-between mb-2">
                <label className="label" style={{ margin: 0 }}>Job Description *</label>
                <button type="button" className="btn-secondary btn-sm" onClick={handleAIGenerate} disabled={aiLoading}>
                  {aiLoading ? <span className="flex-center gap-2"><span className="loading-spinner sm" />Generating...</span> : '✨ AI Generate'}
                </button>
              </div>
              <textarea id="job-desc" className="input-field" rows={10} placeholder="Describe the role, responsibilities, and what you're looking for..." value={form.description} onChange={set('description')} required />
            </div>
            <div className="form-group">
              <label className="label">Requirements</label>
              <textarea id="job-req" className="input-field" rows={5} placeholder="List the required qualifications, skills, and experience..." value={form.requirements} onChange={set('requirements')} />
            </div>
            <div className="form-group">
              <label className="label">Responsibilities</label>
              <textarea id="job-resp" className="input-field" rows={5} placeholder="List the key responsibilities for this role..." value={form.responsibilities} onChange={set('responsibilities')} />
            </div>
          </Section>

          {/* Section 3: Compensation */}
          <Section title="💰 Compensation">
            <div className="grid-3">
              <div className="form-group">
                <label className="label">Currency</label>
                <select className="input-field" value={form.salary_currency} onChange={set('salary_currency')}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Min Salary / year</label>
                <input id="salary-min" type="number" className="input-field" placeholder="e.g. 80000" value={form.salary_min} onChange={set('salary_min')} min={0} />
              </div>
              <div className="form-group">
                <label className="label">Max Salary / year</label>
                <input id="salary-max" type="number" className="input-field" placeholder="e.g. 120000" value={form.salary_max} onChange={set('salary_max')} min={0} />
              </div>
            </div>
          </Section>

          {/* Section 4: Skills */}
          <Section title="🛠 Required Skills">
            <div className="form-group">
              <label className="label">Add Skills (press Enter or comma)</label>
              <input
                id="skill-input"
                type="text"
                className="input-field"
                placeholder="e.g. React, Node.js, TypeScript..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
              />
            </div>
            {form.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills_required.map(skill => (
                  <span key={skill} className="skill-tag">
                    {skill}
                    <button className="remove-tag" onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* Section 5: Settings */}
          <Section title="⚙️ Settings">
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Application Deadline</label>
                <input id="job-deadline" type="date" className="input-field" value={form.application_deadline} onChange={set('application_deadline')} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="label">Job Status</label>
                <div className="flex items-center gap-3" style={{ height: 46 }}>
                  <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
                    <input type="checkbox" checked={form.is_active} onChange={set('is_active')} style={{ width:18,height:18,accentColor:'var(--purple)',cursor:'pointer' }} />
                    <span style={{ fontSize:14 }}>Active (accepting applications)</span>
                  </label>
                </div>
              </div>
            </div>
          </Section>

          <div className="flex gap-4 justify-end">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard/employer')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding:'14px 32px' }}>
              {loading ? <span className="flex-center gap-2"><span className="loading-spinner sm" />Posting...</span> : '🚀 Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
