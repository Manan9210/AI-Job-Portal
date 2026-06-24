import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#10B981' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  color: '#EF4444' },
    info:    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', color: '#3B82F6' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#F59E0B' },
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: colors[toast.type]?.bg || colors.info.bg,
            border: `1px solid ${colors[toast.type]?.border || colors.info.border}`,
            borderRadius: '12px', padding: '14px 18px', minWidth: '280px', maxWidth: '380px',
            backdropFilter: 'blur(20px)', animation: 'slideInRight 0.3s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <span style={{ fontSize: '18px' }}>{icons[toast.type]}</span>
            <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '16px', padding: '0 4px', lineHeight: 1
            }}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
