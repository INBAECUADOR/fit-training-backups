import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { aiGeneratePlan, aiApprovePlan, adminGetUsers } from '../api'
import { Bot, Loader2, AlertCircle, Check, ChevronDown, ChevronUp, User, Dumbbell, Apple, RefreshCw } from 'lucide-react'

const GOALS = ['bajar de peso', 'ganar masa muscular', 'tonificar', 'mantener peso', 'resistencia', 'fuerza']
const EXPERIENCE = ['principiante', 'intermedio', 'avanzado']
const GENDERS = ['masculino', 'femenino']
const EQUIPMENT = ['gimnasio completo', 'gimnasio básico', 'casa con mancuernas', 'casa sin equipamiento']

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MEAL_LABELS = { breakfast: 'Desayuno', morning_snack: 'Snack Mañana', lunch: 'Almuerzo', afternoon_snack: 'Snack Tarde', dinner: 'Cena' }

export default function AgentIA() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [form, setForm] = useState({
    age: '', weight: '', height: '', gender: '', goal: '',
    experience: '', trainingDays: '5', mealsPerDay: '5',
    allergies: '', conditions: '', equipment: 'gimnasio completo',
  })
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [expandedDay, setExpandedDay] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    adminGetUsers().then(data => {
      setUsers(data.filter(u => u.role !== 'admin'))
    }).catch(() => {})
  }, [])

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleGenerate = async () => {
    if (!form.age || !form.trainingDays || !form.mealsPerDay) {
      setError('Completá al menos edad, días de entrenamiento y comidas al día')
      return
    }
    setGenerating(true)
    setError('')
    setResult(null)
    setSuccess('')
    try {
      const data = await aiGeneratePlan(form)
      setResult(data)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.raw?.substring(0, 300) || 'Error al generar el plan'
      setError(msg)
    }
    setGenerating(false)
  }

  const handleApprove = async () => {
    if (!selectedUser) { setError('Seleccioná un usuario para asignar el plan'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const data = await aiApprovePlan({
        userId: parseInt(selectedUser),
        routines: result.routines,
        diet: result.diet,
      })
      setSuccess(`Plan asignado correctamente a ${users.find(u => u.id === parseInt(selectedUser))?.name || ''}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al asignar el plan')
    }
    setSaving(false)
  }

  const renderDietDay = (day) => {
    const meals = result.diet[day]
    if (!meals) return <p className="text-gray-500 text-sm">Sin datos</p>
    return (
      <div className="space-y-2">
        {Object.entries(meals).map(([type, desc]) => (
          <div key={type} className="bg-gym-800/30 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{MEAL_LABELS[type] || type}</p>
            <p className="text-sm text-white">{desc}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bot size={28} className="text-gym-300" />
          <div>
            <h1 className="text-3xl font-extrabold text-white">Agente IA</h1>
            <p className="text-gray-400 text-sm">Generá rutinas y dietas personalizadas con IA</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-gym-300" /> Datos del cliente
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Edad *</label>
                  <input type="number" value={form.age} onChange={e => update('age', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Peso (kg)</label>
                  <input type="number" value={form.weight} onChange={e => update('weight', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Altura (cm)</label>
                  <input type="number" value={form.height} onChange={e => update('height', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Género</label>
                  <select value={form.gender} onChange={e => update('gender', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                    <option value="">Seleccionar</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Objetivo</label>
                  <select value={form.goal} onChange={e => update('goal', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                    <option value="">Seleccionar</option>
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Experiencia</label>
                  <select value={form.experience} onChange={e => update('experience', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                    <option value="">Seleccionar</option>
                    {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Días x semana *</label>
                  <input type="number" min={1} max={7} value={form.trainingDays} onChange={e => update('trainingDays', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Comidas x día *</label>
                  <input type="number" min={2} max={6} value={form.mealsPerDay} onChange={e => update('mealsPerDay', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Equipo disponible</label>
                  <select value={form.equipment} onChange={e => update('equipment', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                    {EQUIPMENT.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Alergias / intolerancias</label>
                  <input value={form.allergies} onChange={e => update('allergies', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Ej: lactosa, gluten, frutos secos..." />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Condiciones / lesiones</label>
                  <input value={form.conditions} onChange={e => update('conditions', e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Ej: dolor lumbar, hombro lesionado..." />
                </div>
              </div>
              <button onClick={handleGenerate} disabled={generating}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl font-bold transition hover:opacity-90 disabled:opacity-50">
                {generating ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
                {generating ? 'Generando...' : 'Generar plan con IA'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-gym-900/50 border border-gym-400/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-gym-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">Error</p>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-300 text-sm">{success}</p>
              </div>
            )}

            {!result && !generating && !error && (
              <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-10 text-center">
                <Bot size={48} className="text-gym-700 mx-auto mb-4" />
                <p className="text-gray-500">Completá los datos del cliente y generá el plan</p>
              </div>
            )}

            {generating && (
              <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-10 text-center">
                <Loader2 size={40} className="text-gym-300 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">El agente IA está generando el plan personalizado...</p>
                <p className="text-gray-600 text-xs mt-2">Esto puede tomar hasta 30 segundos</p>
              </div>
            )}

            {result && !generating && (
              <div className="space-y-4">
                <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Dumbbell size={18} className="text-gym-300" /> Rutina
                    </h2>
                    {result.dailyCalories && (
                      <span className="text-sm text-gym-300 font-bold">~{result.dailyCalories} kcal/día</span>
                    )}
                  </div>
                  {result.notes && (
                    <p className="text-xs text-gray-500 mb-3 italic">{result.notes}</p>
                  )}
                  <div className="space-y-2">
                    {Object.entries(result.routines).map(([day, dayData]) => (
                      <div key={day} className="bg-gym-800/50 rounded-xl overflow-hidden">
                        <button onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gym-700/50 transition">
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">{day}</p>
                            <p className="text-xs text-gray-500">{dayData.day_label}</p>
                          </div>
                          {expandedDay === day ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                        </button>
                        {expandedDay === day && (
                          <div className="px-4 pb-3 space-y-1.5">
                            {dayData.exercises?.map((ex, i) => (
                              <div key={i} className="bg-gym-700/30 rounded-lg px-3 py-2 flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-white">{ex.name}</p>
                                  {ex.observation && <p className="text-xs text-gray-500">{ex.observation}</p>}
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <p className="text-sm font-bold text-gym-300">{ex.series}×{ex.reps}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    <Apple size={18} className="text-gym-300" /> Dieta
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(result.diet).map(([day, meals]) => (
                      <div key={day} className="bg-gym-800/50 rounded-xl overflow-hidden">
                        <button onClick={() => setExpandedDay(expandedDay === `diet-${day}` ? null : `diet-${day}`)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gym-700/50 transition">
                          <p className="text-sm font-bold text-white">{day}</p>
                          {expandedDay === `diet-${day}` ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                        </button>
                        {expandedDay === `diet-${day}` && (
                          <div className="px-4 pb-3">
                            {renderDietDay(day)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-4">
                  <label className="text-xs text-gray-500 block mb-2">Asignar plan a usuario</label>
                  <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                    className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-gym-400">
                    <option value="">Seleccionar usuario</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.document_id})</option>)}
                  </select>
                  <button onClick={handleApprove} disabled={saving || !selectedUser}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-xl font-bold transition hover:opacity-90 disabled:opacity-50">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    {saving ? 'Asignando...' : 'Asignar plan al usuario'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
