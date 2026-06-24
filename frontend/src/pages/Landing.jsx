import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '📄', title: 'AI Resume Analyzer', desc: 'Get instant AI feedback on your resume with ATS compatibility score, strengths, weaknesses, and actionable improvements.' },
  { icon: '🎯', title: 'Smart Job Matching', desc: 'AI compares your profile against job requirements and gives a match score with missing skills analysis.' },
  { icon: '✉️', title: 'Cover Letter Generator', desc: 'Generate personalized, professional cover letters tailored to each job in seconds using Gemini AI.' },
  { icon: '📝', title: 'Job Description AI', desc: 'Employers can generate complete, inclusive job descriptions with one click — saving hours of writing.' },
]

const CATEGORIES = [
  { icon: '💻', name: 'Technology', count: '1,240+ jobs' },
  { icon: '🎨', name: 'Design', count: '380+ jobs' },
  { icon: '📊', name: 'Marketing', count: '520+ jobs' },
  { icon: '💰', name: 'Finance', count: '670+ jobs' },
  { icon: '🏥', name: 'Healthcare', count: '430+ jobs' },
  { icon: '⚙️', name: 'Engineering', count: '890+ jobs' },
  { icon: '🔬', name: 'Data Science', count: '760+ jobs' },
  { icon: '🌍', name: 'Remote', count: '2,100+ jobs' },
]

const STEPS = [
  { num: '1', title: 'Create Your Profile', desc: 'Sign up as a job seeker or employer and fill out your profile to get personalized recommendations.' },
  { num: '2', title: 'Use AI Tools', desc: 'Analyze your resume, get a job match score, and generate a custom cover letter with Gemini AI.' },
  { num: '3', title: 'Apply & Get Hired', desc: 'Apply to your matched jobs with AI-generated cover letters and track every application in your dashboard.' },
]

export default function Landing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const dashPath = profile?.role === 'employer' ? '/dashboard/employer' : '/dashboard/seeker'

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨</span> Powered by Google Gemini AI
          </div>
          <h1 className="hero-title">
            Find Your Dream Job<br />
            <span className="gradient-text">With The Power of AI</span>
          </h1>
          <p className="hero-subtitle">
            NexusJobs uses advanced AI to match you with perfect opportunities, analyze your resume, and help you stand out from the crowd.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <button className="hero-btn-primary" onClick={() => navigate(dashPath)}>Go to Dashboard →</button>
                <button className="hero-btn-secondary" onClick={() => navigate('/jobs')}>Browse Jobs</button>
              </>
            ) : (
              <>
                <button className="hero-btn-primary" onClick={() => navigate('/register')}>Get Started Free →</button>
                <button className="hero-btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              </>
            )}
          </div>
          <div className="hero-stats">
            {[['10K+','Jobs Posted'],['5K+','Companies'],['95%','Match Rate'],['50K+','Candidates']].map(([val, lbl], i, arr) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <div className="hero-stat">
                  <div className="hero-stat-value gradient-text">{val}</div>
                  <div className="hero-stat-label">{lbl}</div>
                </div>
                {i < arr.length - 1 && <div className="hero-stat-divider" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="section-title">Everything You Need to <span className="gradient-text">Land the Job</span></h2>
            <p className="section-subtitle">Four powerful AI tools that give you the competitive edge</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="section-title">How <span className="gradient-text">NexusJobs</span> Works</h2>
            <p className="section-subtitle">Get hired in 3 simple steps</p>
          </div>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.num} className="step-card">
                <div className="step-number">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="landing-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
            <p className="section-subtitle">Explore thousands of opportunities across every field</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(c => (
              <div key={c.name} className="category-card" onClick={() => navigate('/jobs')}>
                <span className="category-icon">{c.icon}</span>
                <div className="category-name">{c.name}</div>
                <div className="category-count">{c.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent)',
              borderRadius: '50%', filter: 'blur(40px)',
            }} />
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>
              Ready to Find Your <span className="gradient-text">Dream Job?</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
              Join thousands of professionals using NexusJobs AI to accelerate their careers.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="hero-btn-primary" onClick={() => navigate('/register')}>Start for Free →</button>
              <button className="hero-btn-secondary" onClick={() => navigate('/jobs')}>Browse Jobs</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 20 }}>🚀</span>
              <span className="gradient-text" style={{ fontWeight: 800, fontSize: 18 }}>NexusJobs</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              © 2024 NexusJobs. AI-Powered Job Portal built with MERN + Supabase.
            </p>
            <div className="flex gap-4">
              <Link to="/jobs" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Jobs</Link>
              <Link to="/ai-tools" style={{ color: 'var(--text-muted)', fontSize: 13 }}>AI Tools</Link>
              <Link to="/register" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
