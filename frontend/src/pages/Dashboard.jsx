import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard, saveWeight, uploadAvatar } from '../api'
import Navbar from '../components/Navbar'
import { Flame, Calendar, Trophy, Activity, Dumbbell, ArrowRight, Weight, Camera } from 'lucide-react'

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [weightInput, setWeightInput] = useState('')
  const [weightSaved, setWeightSaved] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    getDashboard().then(setData).catch(() => {})
  }, [])

  const handleWeightSave = async e => {
    e.preventDefault()
    if (!weightInput) return
    try {
      await saveWeight(parseFloat(weightInput))
      setWeightSaved(true)
      setWeightInput('')
      setTimeout(() => setWeightSaved(false), 2000)
      const updated = await getDashboard()
      setData(updated)
    } catch {}
  }

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const { avatar_url } = await uploadAvatar(file)
      const updatedUser = { ...user, avatar_url }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload()
    } catch { setAvatarUploading(false) }
  }

  if (!data) return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Cargando dashboard...</div>
    </div>
  )

  const firstName = data.userName?.split(' ')[0] || ''
  const greeting = firstName.toLowerCase().endsWith('a') ? 'Bienvenida' : 'Bienvenido'

  const hasMembership = user.membership_end_date && user.membership_end_date.trim() !== ''
  const isExpired = hasMembership && new Date(user.membership_end_date) < new Date()
  const membershipEndDate = hasMembership ? new Date(user.membership_end_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : null
  const membershipStartDate = user.membership_start_date ? new Date(user.membership_start_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : null
  const daysLeft = hasMembership ? Math.ceil((new Date(user.membership_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile header with avatar */}
        <div className="flex items-center gap-4 mb-8 bg-gradient-to-r from-gym-800/80 to-gym-900/80 border border-gym-700/30 rounded-2xl p-5">
          <div className="relative shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Tu foto"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gym-500 shadow-xl"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gym-400 to-orange-500 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl border-2 border-gym-500 shadow-xl">
                {getInitials(data.userName || user.name)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 p-1.5 bg-gym-700 hover:bg-gym-600 rounded-full border-2 border-gym-900 shadow transition disabled:opacity-50"
            >
              <Camera size={12} className="text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-extrabold text-white truncate">¡{greeting}, {firstName}!</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Hoy es <span className="text-gym-300 font-semibold">{data.todayName}</span>
              {data.isWeekend && <span className="text-gray-500 ml-2">— día de descanso</span>}
            </p>
            <p className="text-[10px] sm:text-xs text-gym-400/70 mt-1 font-medium tracking-wide">
              Plataforma hecha por Ing. Jose Luis Enriquez
            </p>
          </div>
        </div>

        {/* Membership card */}
        <div className="mb-6 bg-gradient-to-r from-gym-800/80 to-gym-900/80 border border-gym-700/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${hasMembership ? (isExpired ? 'bg-red-500/20' : 'bg-emerald-500/20') : 'bg-gym-700/50'}`}>
                <Calendar size={20} className={hasMembership ? (isExpired ? 'text-red-400' : 'text-emerald-400') : 'text-gray-500'} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Plan contratado</p>
                <p className="text-white font-bold text-base">Plan Personalizado</p>
                {hasMembership && (
                  <p className={`text-sm mt-0.5 ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isExpired ? `Vencida el ${membershipEndDate}` : `Vigente hasta ${membershipEndDate}`}
                  </p>
                )}
                {!hasMembership && (
                  <p className="text-sm text-gray-500 mt-0.5">Sin membresía activa</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              {hasMembership && !isExpired && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                  <p className="text-2xl font-extrabold text-emerald-400">{daysLeft}</p>
                  <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-semibold">días restantes</p>
                </div>
              )}
              {hasMembership && isExpired && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Suspendido</p>
                </div>
              )}
              {!hasMembership && (
                <div className="bg-gym-700/30 border border-gym-700/40 rounded-xl px-3 py-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sin plan</p>
                </div>
              )}
            </div>
          </div>
          {/* Progress bar */}
          {hasMembership && !isExpired && (() => {
            const start = user.membership_start_date ? new Date(user.membership_start_date) : new Date(user.membership_end_date)
            const end = new Date(user.membership_end_date)
            const total = end - start
            const elapsed = new Date() - start
            const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0
            return (
              <div className="mt-3">
                <div className="h-1.5 bg-gym-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>{membershipStartDate || 'Inicio'}</span>
                  <span>{membershipEndDate}</span>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Motivational quote */}
        {data.motivation && (
          <div className="mb-6 bg-gradient-to-r from-gym-800/80 to-gym-900/80 border border-gym-700/30 rounded-2xl p-5 shadow-xl text-center">
            <p className="text-sm sm:text-base text-gym-200 italic leading-relaxed">&ldquo;{data.motivation.text}&rdquo;</p>
            {data.motivation.author && (
              <p className="text-xs text-gym-400/70 mt-2 font-medium">— {data.motivation.author}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {!data.isWeekend && data.routineToday ? (
            <div className="bg-gradient-to-br from-gym-800 to-gym-900 border border-gym-700/50 rounded-2xl p-6 hover:border-gym-600 transition shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-gym-400 to-orange-500 rounded-xl shadow-lg">
                  <Dumbbell size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rutina de hoy</p>
                  <p className="text-white font-bold text-lg">{data.routineToday.day_label}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{data.exerciseCount} ejercicios</span>
                <button
                  onClick={() => navigate('/routine')}
                  className="flex items-center gap-1.5 text-sm font-bold text-gym-300 hover:text-gym-200 transition"
                >
                  Ver rutina <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gym-800 to-gym-900 border border-gym-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gym-700 rounded-xl">
                  <Activity size={20} className="text-gray-400" />
                </div>
                <p className="text-white font-bold text-lg">Día de descanso</p>
              </div>
              <p className="text-sm text-gray-500">Recuperación activa — estiramientos o cardio liviano</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-gym-800 to-gym-900 border border-gym-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-lg">
                <Weight size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Peso corporal</p>
                {data.latestWeight ? (
                  <p className="text-white font-bold text-lg">{data.latestWeight.weight} kg</p>
                ) : (
                  <p className="text-gray-500 text-sm">Sin registro</p>
                )}
              </div>
            </div>
            <form onSubmit={handleWeightSave} className="flex gap-2">
              <input
                type="number" step="0.1" value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                placeholder="Registrá tu peso"
                className="flex-1 px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gym-400 transition"
              />
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-bold text-sm transition shadow-lg ${
                  weightSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-gym-400 to-orange-500 text-white hover:from-red-500 hover:to-orange-600'
                }`}
              >
                {weightSaved ? '✓' : 'Guardar'}
              </button>
            </form>
            {data.latestWeight && (
              <p className="text-xs text-gray-500 mt-2">
                Último registro: {new Date(data.latestWeight.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: Flame, label: 'Racha', value: data.streak, unit: 'días', color: 'from-gym-400 to-orange-500' },
            { icon: Calendar, label: 'Entrenos', value: data.totalWorkoutDays, unit: 'días', color: 'from-gym-300 to-amber-500' },
            { icon: Trophy, label: 'Records', value: data.totalPRs, unit: 'ejerc.', color: 'from-yellow-500 to-amber-400' },
            { icon: Activity, label: 'Series', value: data.totalResults, unit: 'totales', color: 'from-emerald-400 to-green-500' },
          ].map(stat => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-lg text-center`}>
              <stat.icon size={16} className="text-white/80 mx-auto mb-1.5" />
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>

        {data.recentResults.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-gym-400" />
              Últimos registros
            </h2>
            <div className="space-y-2">
              {data.recentResults.map((r, i) => (
                <div key={i} className="bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gym-800/70 transition">
                  <div className="flex items-center gap-3">
                    <Dumbbell size={14} className="text-gym-300 shrink-0" />
                    <span className="text-sm text-white font-medium">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gym-300 font-bold">{r.weight} kg</span>
                    <span className="text-gym-200 font-bold">{r.reps} reps</span>
                    <span className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer signature */}
        <div className="mt-12 pt-6 border-t border-gym-800 text-center">
          <img
            src="https://enriquezmania.com/wp-content/uploads/2024/08/logo.png"
            alt="EnriquezMania"
            className="h-8 mx-auto mb-2 opacity-50"
          />
          <p className="text-xs text-gym-400/50 font-medium tracking-wide">
            Plataforma hecha por Ing. Jose Luis Enriquez
          </p>
        </div>
      </div>
    </div>
  )
}
