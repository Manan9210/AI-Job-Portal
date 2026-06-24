import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const ALL_SKILLS = ['JavaScript','TypeScript','React','Vue','Angular','Node.js','Python','Java','Go','Rust','SQL','MongoDB','PostgreSQL','AWS','Docker','Kubernetes','GraphQL','REST APIs','Git','Figma','CSS','HTML']

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    full_name: '', bio: '', location: '', phone: '',
    linkedin_url: '', github_url: '', portfolio_url: '', resume_url: '',
    company_name: '', company_description: '', company_website: '',
    skills: [],
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name:           profile.full_name || '',
        bio:                 profile.bio || '',
        location:            profile.location || '',
        phone:               profile.phone || '',
        linkedin_url:        profile.linkedin_url || '',
        github_url:          profile.github_url || '',
        portfolio_url:       profile.portfolio_url || '',
        resume_url:          profile.resume_url || '',
        company_name:        profile.company_name || '',
        company_description: profile.company_description || '',
        company_website:     profile.company_website || '',
        skills:              profile.skills || [],
      })
    }
  }, [profile])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const addSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const skill = skillInput.trim().replace(/,$/, '')
      if (skill && !form.skills.includes(skill)) {
        setForm(f => ({ ...f, skills: [...f.skills, skill] }))
      }
      setSkillInput('')
    }
  }

  const addPresetSkill = (skill) => {
    if (!form.skills.includes(skill)) setForm(f => ({ ...f, skills: [...f.skills, skill] }))
  }

  const removeSkill = (skill) => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }))

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').update({
        full_name:           form.full_name,
        bio:                 form.bio,
        location:            form.location,
        phone:               form.phone,
        linkedin_url:        form.linkedin_url,
        github_url:          form.github_url,
        portfolio_url:       form.portfolio_url,
        resume_url:          form.resume_url,
        company_name:        form.company_name,
        company_description: form.company_description,
        company_website:     form.company_website,
        skills:              form.skills,
        updated_at:          new Date().toISOString(),
      }).eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      showToast('Profile saved! ✅', 'success')
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error')
    } finally { setLoading(false) }
  }

  // Profile completeness
  const fields = profile?.role === 'employer'
    ? ['full_name','company_name','company_description','location','phone','company_website']
    : ['full_name','bio','location','phone','linkedin_url','github_url','resume_url']
  const filled = fields.filter(f => form[f] && String(form[f]).length > 0).length
  const completeness = Math.round((filled / fields.length) * 100)

  const initials = form.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?'
  const isEmployer = profile?.role === 'employer'

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 800 }}>
        <div className="page-header">
          <h1 className="section-title">My <span className="gradient-text">Profile</span></h1>
          <p className="section-subtitle">Keep your profile up to date to improve visibility and matches</p>
        </div>

        {/* Profile Header Card */}
        <div className="card mb-6" style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.08))', borderColor:'rgba(124,58,237,0.25)' }}>
          <div className="flex gap-4 items-center" style={{ flexWrap:'wrap' }}>
            <div className="profile-avatar-large">{initials}</div>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:20,fontWeight:800,marginBottom:4 }}>{form.full_name || 'Your Name'}</h2>
              <p style={{ color:'var(--text-secondary)',fontSize:14,marginBottom:8 }}>
                {profile?.email} · <span className="badge badge-purple">{profile?.role}</span>
              </p>
              {/* Completeness */}
              <div>
                <div className="flex-between mb-2">
                  <span style={{ fontSize:12,color:'var(--text-muted)' }}>Profile Completeness</span>
                  <span style={{ fontSize:12,fontWeight:700,color: completeness===100?'var(--green)':'var(--purple-light)' }}>{completeness}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width:`${completeness}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card mb-6">
          <h2 style={{ fontSize:17,fontWeight:700,marginBottom:20,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>👤 Basic Information</h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input id="profile-name" type="text" className="input-field" value={form.full_name} onChange={set('full_name')} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="label">Location</label>
              <input id="profile-location" type="text" className="input-field" value={form.location} onChange={set('location')} placeholder="San Francisco, CA" />
            </div>
            <div className="form-group">
              <label className="label">Phone</label>
              <input id="profile-phone" type="tel" className="input-field" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          {!isEmployer && (
            <div className="form-group">
              <label className="label">Bio</label>
              <textarea id="profile-bio" className="input-field" rows={4} value={form.bio} onChange={set('bio')} placeholder="Tell employers about yourself, your experience and what you're looking for..." />
            </div>
          )}
        </div>

        {/* Employer Fields */}
        {isEmployer && (
          <div className="card mb-6">
            <h2 style={{ fontSize:17,fontWeight:700,marginBottom:20,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>🏢 Company Information</h2>
            <div className="form-group">
              <label className="label">Company Name</label>
              <input type="text" className="input-field" value={form.company_name} onChange={set('company_name')} placeholder="Acme Corp" />
            </div>
            <div className="form-group">
              <label className="label">Company Description</label>
              <textarea className="input-field" rows={4} value={form.company_description} onChange={set('company_description')} placeholder="Describe your company, mission, and culture..." />
            </div>
            <div className="form-group">
              <label className="label">Company Website</label>
              <input type="url" className="input-field" value={form.company_website} onChange={set('company_website')} placeholder="https://yourcompany.com" />
            </div>
          </div>
        )}

        {/* Seeker Links */}
        {!isEmployer && (
          <div className="card mb-6">
            <h2 style={{ fontSize:17,fontWeight:700,marginBottom:20,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>🔗 Links & Resume</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">LinkedIn URL</label>
                <input type="url" className="input-field" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="form-group">
                <label className="label">GitHub URL</label>
                <input type="url" className="input-field" value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/..." />
              </div>
              <div className="form-group">
                <label className="label">Portfolio URL</label>
                <input type="url" className="input-field" value={form.portfolio_url} onChange={set('portfolio_url')} placeholder="https://yourportfolio.com" />
              </div>
              <div className="form-group">
                <label className="label">Resume URL</label>
                <input type="url" className="input-field" value={form.resume_url} onChange={set('resume_url')} placeholder="https://drive.google.com/..." />
              </div>
            </div>
          </div>
        )}

        {/* Skills (seekers) */}
        {!isEmployer && (
          <div className="card mb-6">
            <h2 style={{ fontSize:17,fontWeight:700,marginBottom:20,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>🛠 Skills</h2>
            <div className="form-group">
              <label className="label">Add Skills (press Enter or comma)</label>
              <input
                id="profile-skill-input"
                type="text"
                className="input-field"
                placeholder="e.g. React, Python, AWS..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
              />
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.skills.map(skill => (
                  <span key={skill} className="skill-tag">
                    {skill}
                    <button className="remove-tag" onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div>
              <p style={{ fontSize:12,color:'var(--text-muted)',marginBottom:10 }}>QUICK ADD</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SKILLS.filter(s => !form.skills.includes(s)).slice(0,12).map(skill => (
                  <button key={skill} onClick={() => addPresetSkill(skill)} style={{
                    background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)',
                    color:'var(--text-muted)', padding:'4px 12px', borderRadius:100,
                    fontSize:12, cursor:'pointer', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor='var(--purple)'; e.target.style.color='var(--purple-light)' }}
                  onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-muted)' }}>
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ padding:'14px 40px', fontSize:15 }}>
            {loading ? <span className="flex-center gap-2"><span className="loading-spinner sm" />Saving...</span> : '💾 Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
