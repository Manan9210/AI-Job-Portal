export default function Loader({ fullPage = false, size = 'md', text = '' }) {
  const spinner = (
    <div style={{ textAlign: 'center' }}>
      <div className={`loading-spinner ${size}`} />
      {text && <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>{text}</p>}
    </div>
  )
  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', zIndex: 9998,
      }}>
        {spinner}
      </div>
    )
  }
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>{spinner}</div>
}
