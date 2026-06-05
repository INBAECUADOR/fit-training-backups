import React from 'react'
import { LayoutDashboard, Dumbbell, UtensilsCrossed, TrendingUp, Trophy, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/routine', label: 'Rutina', icon: Dumbbell },
  { to: '/diet', label: 'Dieta', icon: UtensilsCrossed },
  { to: '/evolution', label: 'Evolución', icon: TrendingUp },
  { to: '/pr-board', label: 'Records', icon: Trophy },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

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
        </button>

        <div className="flex items-center gap-1">
          {links.map(link => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                location.pathname === link.to
                  ? 'bg-gym-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gym-700/50'
              }`}
            >
              <link.icon size={16} />
              <span className="hidden sm:inline">{link.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-400 hover:text-gym-400 transition"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
