import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getExercises, getRoutines, getAlternatives } from '../api'
import ExerciseCard from '../components/ExerciseCard'
import ResultModal from '../components/ResultModal'
import ExerciseProgress from '../components/ExerciseProgress'
import RestTimer from '../components/RestTimer'
import Navbar from '../components/Navbar'
import { useToast } from '../components/Toast'
import { Dumbbell, RefreshCw } from 'lucide-react'

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

export default function Routine() {
  const [routines, setRoutines] = useState([])
  const [selectedDay, setSelectedDay] = useState('Lunes')
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [progressExercise, setProgressExercise] = useState(null)
  const [showTimer, setShowTimer] = useState(false)
  const [restTimerKey, setRestTimerKey] = useState(0)
  const [autoRestTime, setAutoRestTime] = useState(null)
  const [alternatives, setAlternatives] = useState({})
  const [altLoading, setAltLoading] = useState({})
  const { showToast } = useToast()

  useEffect(() => {
    getRoutines().then(setRoutines).catch(() => showToast('Error al cargar rutinas', 'error'))
  }, [])

  useEffect(() => {
    setLoading(true)
    getExercises(selectedDay)
      .then(setExercises)
      .catch(() => { setExercises([]); showToast('Error al cargar ejercicios', 'error') })
      .finally(() => setLoading(false))
  }, [selectedDay])

  const currentRoutine = routines.find(r => r.day_name === selectedDay)

  const handleSaved = (restSeconds) => {
    setAutoRestTime(restSeconds || 60)
    setShowTimer(true)
    setRestTimerKey(prev => prev + 1)
  }

  const loadAlternatives = useCallback(async (exId) => {
    setAltLoading(p => ({ ...p, [exId]: true }))
    try {
      const data = await getAlternatives(exId)
      setAlternatives(p => ({ ...p, [exId]: data }))
    } catch { showToast('Error al cargar alternativas', 'error') } finally {
      setAltLoading(p => ({ ...p, [exId]: false }))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-4xl mx-auto px-4 py-8">
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Rutina</h1>
            {currentRoutine && (
              <p className="text-gray-400 text-sm mt-1">Día de <span className="text-gym-300 font-semibold">{selectedDay}</span></p>
            )}
          </div>
          {currentRoutine && (
            <span className="bg-gradient-to-r from-gym-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              {currentRoutine.day_label}
            </span>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-gym-400 to-orange-500 text-white shadow-lg shadow-gym-400/30'
                  : 'bg-gym-800 text-gray-400 hover:bg-gym-700'
              }`}
            >
              {day}
            </button>
          ))}
        </motion.div>

        {showTimer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 max-w-xs overflow-hidden">
            <RestTimer key={restTimerKey} autoStart={autoRestTime} onFinish={() => setShowTimer(false)} />
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="shimmer bg-gym-800/30 rounded-2xl p-5 h-32" />
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <motion.div variants={fadeUp} className="text-center py-20">
            <Dumbbell size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay ejercicios para este día</p>
          </motion.div>
        ) : (
          <motion.div variants={stagger} className="grid grid-cols-1 gap-6">
            {exercises.map((ex, i) => (
              <motion.div key={ex.id} variants={fadeUp}>
                <ExerciseCard
                  exercise={ex}
                  onRegister={() => setSelectedExercise(ex)}
                  onProgress={() => setProgressExercise(ex)}
                  alternatives={alternatives[ex.id]}
                  altLoading={altLoading[ex.id]}
                  onLoadAlternatives={() => loadAlternatives(ex.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedExercise && (
          <ResultModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onSaved={(rest) => handleSaved(rest)}
          />
        )}

        {progressExercise && (
          <ExerciseProgress
            exercise={progressExercise}
            onClose={() => setProgressExercise(null)}
          />
        )}
      </motion.div>
    </div>
  )
}
