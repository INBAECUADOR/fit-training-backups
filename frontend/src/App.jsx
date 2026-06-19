import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Routine from './pages/Routine'
import Diet from './pages/Diet'
import Evolution from './pages/Evolution'
import PRBoard from './pages/PRBoard'
import CalorieCalculator from './pages/CalorieCalculator'
import Admin from './pages/Admin'
import AgentIA from './pages/AgentIA'
import Manual from './pages/Manual'
import Footer from './components/Footer'
import { ToastProvider } from './components/Toast'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/" />
  return children
}

function PublicHome() {
  const token = localStorage.getItem('token')
  return token ? <Dashboard /> : <Landing />
}

export default function App() {
  const location = useLocation()
  const hideFooter = location.pathname === '/login' || location.pathname === '/landing'

  return (
    <ToastProvider>
    <div className="min-h-screen bg-gym-900 flex flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PublicHome />} />
          <Route path="/routine" element={<PrivateRoute><Routine /></PrivateRoute>} />
          <Route path="/diet" element={<PrivateRoute><Diet /></PrivateRoute>} />
          <Route path="/evolution" element={<PrivateRoute><Evolution /></PrivateRoute>} />
          <Route path="/pr-board" element={<PrivateRoute><PRBoard /></PrivateRoute>} />
          <Route path="/calories" element={<PrivateRoute><CalorieCalculator /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/ai-agent" element={<AdminRoute><AgentIA /></AdminRoute>} />
          <Route path="/manual" element={<PrivateRoute><Manual /></PrivateRoute>} />
          <Route path="/landing" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </div>
    </ToastProvider>
  )
}
