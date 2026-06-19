import React, { useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { getDiet, saveDiet } from '../api'
import { SkeletonCard } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { Save, Check, UtensilsCrossed } from 'lucide-react'

const mealTimes = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'morning_snack', label: 'Snack Mañana' },
  { key: 'lunch', label: 'Almuerzo' },
  { key: 'afternoon_snack', label: 'Snack Tarde' },
  { key: 'dinner', label: 'Cena' },
]

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function autoResize(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

export default function Diet() {
  const [selectedDay, setSelectedDay] = React.useState('Lunes')
  const [meals, setMeals] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const { showToast } = useToast()
  const textareaRefs = useRef({})

  const setTextareaRef = useCallback((day, mealKey, el) => {
    if (el) {
      textareaRefs.current[`${day}-${mealKey}`] = el
      autoResize(el)
    }
  }, [])

  useEffect(() => {
    getDiet()
      .then(setMeals)
      .catch(() => showToast('Error al cargar el plan de alimentación', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    Object.values(textareaRefs.current).forEach(autoResize)
  }, [meals, selectedDay])

  const updateMeal = (day, mealKey, value) => {
    const updated = { ...meals }
    if (!updated[day]) updated[day] = {}
    updated[day][mealKey] = value
    setMeals(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveDiet(meals)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      showToast('Plan de alimentación guardado', 'success')
    } catch { showToast('Error al guardar el plan de alimentación', 'error') } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Plan de Alimentación</h1>
            <p className="text-gray-400 text-sm mt-1">Gestioná tus comidas del día</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg ${
              saved
                ? 'bg-emerald-500 text-white scale-in'
                : 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 hover:from-emerald-400 hover:to-green-500 hover:brightness-110'
            }`}
          >
            {saving ? 'Guardando...' : saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar</>}
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 shadow-lg'
                  : 'bg-gym-800 text-gray-400 hover:bg-gym-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : !meals ? (
          <div className="text-center py-20">
            <UtensilsCrossed size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No se pudo cargar el plan de alimentación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mealTimes.map(mt => (
              <div key={mt.key} className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-4 hover:border-gym-600 transition-all fade-in-up">
                <label className="block text-sm font-bold text-gym-200 mb-2">{mt.label}</label>
                <textarea
                  ref={el => setTextareaRef(selectedDay, mt.key, el)}
                  value={meals[selectedDay]?.[mt.key] || ''}
                  onChange={e => updateMeal(selectedDay, mt.key, e.target.value)}
                  className="w-full px-4 py-3 bg-gym-900 border border-gym-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gym-200 focus:ring-1 focus:ring-gym-200/30 transition-all resize-none overflow-hidden"
                  rows={1}
                  placeholder="Describí tu comida..."
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
