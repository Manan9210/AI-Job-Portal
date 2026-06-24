import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import JobCard from '../components/JobCard'
import Loader from '../components/Loader'

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship']
const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Engineering', 'Data Science', 'Sales']
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive']
const PER_PAGE = 10

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ jobType: '', category: '', experience: '' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    applyFilters()
    setPage(1)
  }, [jobs, search, filters])

  const fetchJobs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles(full_name, company_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (!error) setJobs(data || [])
    setLoading(false)
  }

  const applyFilters = () => {
    let result = [...jobs]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.company?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.category?.toLowerCase().includes(q)
      )
    }
    if (filters.jobType) result = result.filter(j => j.job_type === filters.jobType)
    if (filters.category) result = result.filter(j => j.category === filters.category)
    if (filters.experience) result = result.filter(j => j.experience_level === filters.experience)
    setFiltered(result)
  }

  const clearFilters = () => setFilters({ jobType: '', category: '', experience: '' })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const FilterOption = ({ label, value, field }) => (
    <button
      className={`filter-option${filters[field] === value ? ' selected' : ''}`}
      onClick={() => setFilters(f => ({ ...f, [field]: f[field] === value ? '' : value }))}
    >
      <span style={{
        width: 14, height: 14, borderRadius: '50%', border: '2px solid',
        borderColor: filters[field] === value ? 'var(--purple-light)' : 'var(--border)',
        background: filters[field] === value ? 'var(--purple)' : 'transparent',
        flexShrink: 0, display: 'inline-block',
      }} />
      {label}
    </button>
  )

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="section-title">Browse <span className="gradient-text">Jobs</span></h1>
          <p className="section-subtitle">{filtered.length} opportunities available</p>
        </div>

        {/* Search */}
        <div className="search-bar-wrapper">
          <input
            id="job-search"
            type="text"
            className="input-field"
            placeholder="🔍  Search jobs by title, company, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 15 }}
          />
          {(search || filters.jobType || filters.category || filters.experience) && (
            <button className="btn-secondary" onClick={() => { setSearch(''); clearFilters() }}>Clear</button>
          )}
        </div>

        <div className="jobs-layout">
          {/* Sidebar Filters */}
          <aside className="filter-sidebar">
            <div className="filter-title">
              <span>🎛 Filters</span>
              {(filters.jobType || filters.category || filters.experience) && (
                <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--purple-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
              )}
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Job Type</div>
              {JOB_TYPES.map(t => <FilterOption key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} value={t} field="jobType" />)}
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Category</div>
              {CATEGORIES.map(c => <FilterOption key={c} label={c} value={c} field="category" />)}
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Experience Level</div>
              {EXP_LEVELS.map(e => <FilterOption key={e} label={e.charAt(0).toUpperCase() + e.slice(1)} value={e} field="experience" />)}
            </div>
          </aside>

          {/* Job List */}
          <div>
            {loading ? (
              <div className="jobs-grid">
                {[1,2,3].map(i => (
                  <div key={i} className="card">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 14, width: '40%' }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '50%' }} />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="btn-secondary" onClick={() => { setSearch(''); clearFilters() }}>Clear filters</button>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {paginated.map(job => <JobCard key={job.id} job={job} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p}>
                          {idx > 0 && arr[idx-1] !== p - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
                          <button className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                        </span>
                      ))
                    }
                    <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
