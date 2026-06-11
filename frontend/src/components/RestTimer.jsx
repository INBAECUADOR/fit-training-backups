import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'

const PRESETS = [30, 60, 90, 120, 180]

export default function RestTimer({ autoStart, onFinish }) {
  const [time, setTime] = useState(60)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (autoStart && !startedRef.current) {
      startedRef.current = true
      const seconds = parseInt(autoStart) || 60
      setTime(seconds)
      setRemaining(seconds)
      setRunning(true)
    }
  }, [autoStart])

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) { setRunning(false); if (onFinish) onFinish(); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, remaining, onFinish])

  const start = (s) => { setTime(s); setRemaining(s); setRunning(true) }
  const pause = () => setRunning(false)
  const resume = () => setRunning(true)
  const reset = () => { setRunning(false); setRemaining(0); startedRef.current = false }

  const format = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="bg-gym-800/80 border border-gym-700/50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={14} className="text-gym-300" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descanso</span>
      </div>

      {remaining > 0 ? (
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-mono font-bold ${remaining <= 10 ? 'text-gym-400 animate-pulse' : 'text-white'}`}>
            {format(remaining)}
          </span>
          <div className="flex gap-1">
            {running ? (
              <button onClick={pause} className="p-1.5 bg-gym-700 rounded-lg hover:bg-gym-600 transition" title="Pausar">
                <Pause size={14} className="text-white" />
              </button>
            ) : (
              <button onClick={resume} className="p-1.5 bg-gym-700 rounded-lg hover:bg-gym-600 transition" title="Reanudar">
                <Play size={14} className="text-white" />
              </button>
            )}
            <button onClick={reset} className="p-1.5 bg-gym-700 rounded-lg hover:bg-gym-600 transition" title="Reiniciar">
              <RotateCcw size={14} className="text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5">
          {PRESETS.map(s => (
            <button
              key={s}
              onClick={() => start(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                time === s ? 'bg-gym-400 text-white shadow-lg shadow-gym-400/30' : 'bg-gym-700 text-gray-300 hover:bg-gym-600'
              }`}
            >
              {s >= 120 ? `${s / 60}:00` : s >= 60 ? `1:00` : `${s}s`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
