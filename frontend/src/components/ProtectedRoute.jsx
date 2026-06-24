import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Loader from './Loader'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader fullPage />
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && profile && profile.role !== requiredRole) {
    const redirect = profile.role === 'employer' ? '/dashboard/employer' : '/dashboard/seeker'
    return <Navigate to={redirect} replace />
  }
  return children
}
