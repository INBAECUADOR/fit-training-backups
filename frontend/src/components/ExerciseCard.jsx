import React from 'react'
import { Clipboard, TrendingUp } from 'lucide-react'

export default function ExerciseCard({ exercise, onRegister, onProgress }) {
  return (
    <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl overflow-hidden hover:border-gym-600 transition group">
      {exercise.gifUrl && (
        <div className="aspect-video bg-gym-900 overflow-hidden">
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-2 leading-tight">{exercise.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <span className="bg-gym-700 px-2 py-0.5 rounded font-semibold text-gym-300">{exercise.series} series</span>
          <span className="bg-gym-700 px-2 py-0.5 rounded font-semibold text-gym-200">{exercise.reps} reps</span>
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
  )
}
