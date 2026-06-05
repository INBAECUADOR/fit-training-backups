import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { getResults } from '../api'
import { X, TrendingUp, Trophy } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function ExerciseProgress({ exercise, onClose }) {
  const [results, setResults] = useState([])
  const [mode, setMode] = useState('weight')

  useEffect(() => {
    getResults(exercise.id).then(setResults).catch(() => {})
  }, [exercise.id])

  const dataPoints = results.slice().reverse()

  const labels = dataPoints.map(r =>
    new Date(r.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
  )

  const datasets = {
    weight: { label: 'Peso (kg)', data: dataPoints.map(r => r.weight), color: '#e94560' },
    reps: { label: 'Repeticiones', data: dataPoints.map(r => r.repetitions), color: '#4ecca3' },
  }

  const chartData = {
    labels,
    datasets: [{
      ...datasets[mode],
      borderColor: datasets[mode].color,
      backgroundColor: datasets[mode].color + '15',
      fill: true,
      tension: 0.35,
      pointBackgroundColor: datasets[mode].color,
      pointBorderColor: '#1a1a2e',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#131313',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: '#333',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      x: { ticks: { color: '#666', maxTicksLimit: 8 }, grid: { color: '#ffffff08' } },
      y: { ticks: { color: '#666' }, grid: { color: '#ffffff08' } },
    },
  }

  const last = results[0]
  const bestWeight = results.reduce((max, r) => r.weight > max ? r.weight : max, 0)
  const bestReps = results.reduce((max, r) => r.repetitions > max ? r.repetitions : max, 0)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gym-800 border border-gym-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-gym-300" />
            <h2 className="font-bold text-white text-lg">Progreso</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-white font-semibold mb-1">{exercise.name}</p>
        {last && (
          <p className="text-xs text-gray-500 mb-4">
            Último registro: {last.weight}kg x {last.repetitions} reps &middot; {new Date(last.created_at).toLocaleDateString('es-MX')}
          </p>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('weight')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'weight' ? 'bg-gym-400 text-white shadow-lg shadow-gym-400/30' : 'bg-gym-700 text-gray-400 hover:bg-gym-600'
            }`}
          >
            Peso
          </button>
          <button
            onClick={() => setMode('reps')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'reps' ? 'bg-gym-200 text-gym-900 shadow-lg shadow-gym-200/30' : 'bg-gym-700 text-gray-400 hover:bg-gym-600'
            }`}
          >
            Reps
          </button>
        </div>

        {dataPoints.length > 1 ? (
          <>
            <div className="bg-gym-900/50 border border-gym-700/30 rounded-xl p-3 mb-4">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-gym-700 to-gym-800 rounded-xl p-3 text-center border border-gym-600/30">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Registros</p>
                <p className="text-xl font-extrabold text-white">{results.length}</p>
              </div>
              <div className="bg-gradient-to-br from-gym-700 to-gym-800 rounded-xl p-3 text-center border border-gym-600/30">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Trophy size={12} className="text-gym-300" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Máx {mode === 'weight' ? 'peso' : 'reps'}</p>
                </div>
                <p className="text-xl font-extrabold text-gym-300">{mode === 'weight' ? bestWeight : bestReps}{mode === 'weight' ? 'kg' : ''}</p>
              </div>
              <div className="bg-gradient-to-br from-gym-700 to-gym-800 rounded-xl p-3 text-center border border-gym-600/30">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Último</p>
                <p className="text-xl font-extrabold text-gym-200">{last ? `${last.weight}kg` : '-'}</p>
              </div>
            </div>
          </>
        ) : dataPoints.length === 1 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <p className="mb-2">Tenés 1 registro. ¡Necesitás al menos 2 para ver la gráfica!</p>
            <p className="text-gray-500">Seguí registrando para visualizar tu progreso.</p>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            Aún no registraste resultados para este ejercicio
          </div>
        )}
      </div>
    </div>
  )
}
