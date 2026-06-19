import React, { useState, useEffect } from 'react'
import { getResults, saveResult, getSuggestion } from '../api'
import { useToast } from './Toast'
import { X, Sparkles, TrendingUp } from 'lucide-react'

export default function ResultModal({ exercise, onClose, onSaved }) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [time, setTime] = useState('')
  const [observation, setObservation] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    getResults(exercise.id).then(results => {
      if (results.length > 0) setLastResult(results[0])
    }).catch(() => {})
    getSuggestion(exercise.id).then(setSuggestion).catch(() => {})
  }, [exercise.id])

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await saveResult({
        exercise_id: exercise.id,
        weight: parseFloat(weight) || 0,
        repetitions: parseInt(reps) || 0,
        time: time || '',
        observation: observation || '',
      })
      if (onSaved) onSaved(exercise.rest ? parseInt(exercise.rest) : 60)
      onClose()
    } catch { showToast('Error al guardar el resultado', 'error') } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gym-800 border border-gym-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-lg">Registrar resultado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">{exercise.name}</p>

        {lastResult && (
          <div className="bg-gym-900/50 border border-gym-700/30 rounded-lg px-4 py-2 mb-4">
            <p className="text-xs text-gray-500 mb-1">Sesión anterior:</p>
            <div className="flex gap-4 text-sm">
              <span className="text-gym-300 font-semibold">{lastResult.weight} kg</span>
              <span className="text-gym-200 font-semibold">{lastResult.repetitions} reps</span>
              {lastResult.time && <span className="text-gray-400">{lastResult.time}</span>}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(lastResult.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })}
            </p>
          </div>
        )}

        {suggestion?.recommended && (
          <div className="bg-gradient-to-r from-gym-900/80 to-gym-800/80 border border-gym-400/30 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={14} className="text-gym-300" />
              <span className="text-xs font-bold text-gym-300 uppercase tracking-wider">Sugerencia IA</span>
            </div>
            <p className="text-sm text-white font-medium">{suggestion.reason}</p>
            <button
              type="button"
              onClick={() => { setWeight(String(suggestion.weight)); setReps(String(suggestion.reps)) }}
              className="mt-2 text-xs font-bold text-gym-200 hover:text-white bg-gym-700/50 hover:bg-gym-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <TrendingUp size={12} />
              Auto-completar sugerencia
            </button>
          </div>
        )}

        {suggestion && !suggestion.recommended && suggestion.totalLogs > 0 && suggestion.lastWeight > 0 && (
          <div className="bg-gym-900/50 border border-gym-700/30 rounded-lg px-4 py-2 mb-4">
            <p className="text-xs text-gray-500">{suggestion.reason}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Peso (kg)</label>
              <input
                type="number" step="0.5" value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gym-400 focus:ring-1 focus:ring-gym-400/30 transition-all"
                placeholder="Ej: 45"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Repeticiones</label>
              <input
                type="number" value={reps}
                onChange={e => setReps(e.target.value)}
                className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gym-400 focus:ring-1 focus:ring-gym-400/30 transition-all"
                placeholder="Ej: 10"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Tiempo</label>
            <input
              type="text" value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gym-400 focus:ring-1 focus:ring-gym-400/30 transition-all"
              placeholder="Ej: 45 min"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Observación</label>
            <textarea
              value={observation}
              onChange={e => setObservation(e.target.value)}
              className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gym-400 transition resize-none"
              rows={2}
              placeholder="¿Cómo sentiste el ejercicio?"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-gradient-to-r from-gym-400 to-orange-500 hover:brightness-110 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
