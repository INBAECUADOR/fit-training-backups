import React, { useState } from 'react'
import { Clipboard, TrendingUp, Maximize2 } from 'lucide-react'

export default function ExerciseCard({ exercise, onRegister, onProgress }) {
  const [expandedGif, setExpandedGif] = useState(null)

  return (
    <>
    <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl overflow-hidden hover:border-gym-600 transition group">
      {exercise.gifUrl && (
        <div className="bg-gym-900 overflow-hidden relative cursor-pointer flex items-center justify-center p-4" onClick={() => setExpandedGif(exercise.gifUrl)}>
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="max-w-full max-h-48 object-contain group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex items-center justify-center">
            <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-2 leading-tight">{exercise.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <span className="bg-gym-700 px-2 py-0.5 rounded font-semibold text-gym-300">{exercise.series} series</span>
          <span className="bg-gym-700 px-2 py-0.5 rounded font-semibold text-gym-200">{exercise.reps} reps</span>
          {exercise.rest && <span className="bg-gym-700/50 px-2 py-0.5 rounded text-xs text-gym-300">Descanso {exercise.rest}</span>}
        </div>
        {exercise.observation && (
          <p className="text-xs text-gray-500 italic mb-3">{exercise.observation}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={onRegister}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gym-700 to-gym-600 hover:from-gym-600 hover:to-gym-500 text-white py-2 rounded-lg text-sm font-semibold transition shadow-lg"
          >
            <Clipboard size={14} />
            Registrar
          </button>
          <button
            onClick={onProgress}
            className="flex items-center justify-center gap-1.5 bg-gym-700/50 hover:bg-gym-700 text-gray-400 hover:text-white py-2 px-3 rounded-lg text-sm transition"
            title="Ver progreso"
          >
            <TrendingUp size={14} />
          </button>
        </div>
      </div>
    </div>

    {expandedGif && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setExpandedGif(null)}>
        <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
          <button onClick={() => setExpandedGif(null)}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition text-lg font-bold">Cerrar ✕</button>
          <img src={expandedGif} alt="Ejercicio" className="w-full rounded-xl shadow-2xl" />
        </div>
      </div>
    )}
    </>
  )
}
