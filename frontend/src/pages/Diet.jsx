import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { getDiet, saveDiet } from '../api'
import { Save } from 'lucide-react'

const mealTimes = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'morning_snack', label: 'Snack Mañana' },
  { key: 'lunch', label: 'Almuerzo' },
  { key: 'afternoon_snack', label: 'Snack Tarde' },
  { key: 'dinner', label: 'Cena' },
]

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Diet() {
  const [selectedDay, setSelectedDay] = React.useState('Lunes')
  const [meals, setMeals] = React.useState({})
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  useEffect(() => {
    getDiet().then(setMeals).catch(() => {})
  }, [])

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
    } catch {} finally {
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
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition shadow-lg ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 hover:from-emerald-400 hover:to-green-500'
            }`}
          >
            <Save size={16} />
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 shadow-lg'
                  : 'bg-gym-800 text-gray-400 hover:bg-gym-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mealTimes.map(mt => (
            <div key={mt.key} className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-4 hover:border-gym-600 transition">
              <label className="block text-sm font-bold text-gym-200 mb-2">{mt.label}</label>
              <textarea
                value={meals[selectedDay]?.[mt.key] || ''}
                onChange={e => updateMeal(selectedDay, mt.key, e.target.value)}
                className="w-full px-4 py-3 bg-gym-900 border border-gym-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gym-200 transition resize-none"
                rows={3}
                placeholder="Describí tu comida..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
