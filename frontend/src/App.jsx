import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import SeekerDashboard from './pages/SeekerDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import PostJob from './pages/PostJob'
import AITools from './pages/AITools'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="/dashboard/seeker" element={<ProtectedRoute requiredRole="seeker"><SeekerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/employer" element={<ProtectedRoute requiredRole="employer"><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute requiredRole="employer"><PostJob /></ProtectedRoute>} />
          <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
