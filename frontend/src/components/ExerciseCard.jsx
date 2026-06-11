import React, { useState } from 'react'
import { Clipboard, TrendingUp, Maximize2, RefreshCw, Search } from 'lucide-react'

export default function ExerciseCard({ exercise, onRegister, onProgress, alternatives, altLoading, onLoadAlternatives }) {
  const [expandedGif, setExpandedGif] = useState(null)
  const [showAlt, setShowAlt] = useState(false)
  const lastRestNum = exercise.rest ? parseInt(exercise.rest) : 0

  return (
    <>
    <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl overflow-hidden hover:border-gym-600 transition group">
      {exercise.gifUrl ? (
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
      ) : (
        <div className="bg-gym-900 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Search size={16} className="text-gym-400" />
            <span className="text-xs text-gray-500">Sin imagen disponible</span>
          </div>
          {!showAlt && onLoadAlternatives && (
            <button onClick={() => { setShowAlt(true); if (!alternatives) onLoadAlternatives() }}
              className="text-xs font-bold text-gym-300 hover:text-white bg-gym-700/50 hover:bg-gym-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 mx-auto">
              <RefreshCw size={12} /> Ver alternativas
            </button>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-2 leading-tight">{exercise.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <span className="bg-gym-700 px-2 py-0.5 rounded font-semibold text-gym-300">{exercise.series} series</span>
          <span className="bg-gym-700 px-2 py-0.5 rounded font-semibold text-gym-200">{exercise.reps} reps</span>
          {lastRestNum > 0 && <span className="bg-gym-700/50 px-2 py-0.5 rounded text-xs text-gym-300">Descanso {lastRestNum}s</span>}
        </div>
        {exercise.observation && (
          <p className="text-xs text-gray-500 italic mb-3">{exercise.observation}</p>
        )}

        {/* Alternatives */}
        {showAlt && altLoading && (
          <div className="text-xs text-gray-500 mb-3 flex items-center gap-2"><RefreshCw size={12} className="animate-spin" /> Buscando alternativas...</div>
        )}
        {showAlt && !altLoading && alternatives && alternatives.length > 0 && (
          <div className="mb-3 bg-gym-900/50 border border-gym-700/30 rounded-lg p-3">
            <p className="text-[10px] text-gym-300 uppercase tracking-wider font-bold mb-2">Alternativas similares</p>
            <div className="grid grid-cols-2 gap-2">
              {alternatives.map(a => (
                <div key={a.id} className="bg-gym-800/50 rounded-lg p-2 text-center cursor-pointer hover:bg-gym-700/50 transition" onClick={() => { if (a.gifUrl) setExpandedGif(a.gifUrl) }}>
                  <p className="text-xs text-white truncate font-medium">{a.name_es || a.name}</p>
                  {a.gifUrl && <p className="text-[9px] text-gym-400 mt-1">Click para ver GIF</p>}
                  {!a.gifUrl && <p className="text-[9px] text-gray-600 mt-1">Sin imagen</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {showAlt && !altLoading && alternatives && alternatives.length === 0 && (
          <p className="text-xs text-gray-500 mb-3">No se encontraron alternativas</p>
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
