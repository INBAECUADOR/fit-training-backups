import React from 'react'
import { LayoutDashboard, Dumbbell, UtensilsCrossed, TrendingUp, Trophy, LogOut, Calculator, Shield, Bot } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/routine', label: 'Rutina', icon: Dumbbell },
  { to: '/diet', label: 'Dieta', icon: UtensilsCrossed },
  { to: '/evolution', label: 'Evolución', icon: TrendingUp },
  { to: '/pr-board', label: 'Records', icon: Trophy },
  { to: '/calories', label: 'Calorías', icon: Calculator },
  { to: '/admin', label: 'Admin', icon: Shield },
  { to: '/ai-agent', label: 'Agente IA', icon: Bot },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const membershipEnd = user.membership_end_date
  const isExpired = membershipEnd && new Date(membershipEnd) < new Date()
  const expiringSoon = membershipEnd && !isExpired && (new Date(membershipEnd) - new Date()) / (1000*60*60*24) <= 15

  const visibleLinks = isAdmin ? links : links.filter(l => l.to !== '/admin' && l.to !== '/ai-agent')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-gym-800/80 backdrop-blur border-b border-gym-700/50 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <img
            src="https://enriquezmania.com/wp-content/uploads/2024/08/logo.png"
            alt="EnriquezMania"
            className="h-9 w-auto"
          />
          <span className="font-extrabold text-white text-lg hidden sm:block">EnriquezMania</span>
          {isExpired && <span className="ml-2 bg-gym-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">SUSPENDIDO</span>}
          {expiringSoon && <span className="ml-2 bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">PRÓXIMO A VENCER</span>}
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
          {visibleLinks.map(link => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-semibold transition whitespace-nowrap ${
                location.pathname === link.to
                  ? 'bg-gym-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gym-700/50'
              }`}
            >
              <link.icon size={18} className="sm:size-[16]" />
              <span>{link.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-1 sm:ml-2 p-2 text-gray-400 hover:text-gym-400 transition shrink-0"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}
