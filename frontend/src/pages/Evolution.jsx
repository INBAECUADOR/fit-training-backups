import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { getMeasurements, saveMeasurement, downloadExport } from '../api'
import Navbar from '../components/Navbar'
import { Download } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Evolution() {
  const [measurements, setMeasurements] = useState([])
  const [form, setForm] = useState({ weight: '', chest: '', waist: '', arms: '', legs: '', notes: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    getMeasurements().then(setMeasurements).catch(() => {})
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    const data = {
      weight: parseFloat(form.weight) || 0,
      chest: parseFloat(form.chest) || 0,
      waist: parseFloat(form.waist) || 0,
      arms: parseFloat(form.arms) || 0,
      legs: parseFloat(form.legs) || 0,
      notes: form.notes,
    }
    try {
      await saveMeasurement(data)
      const updated = await getMeasurements()
      setMeasurements(updated)
      setForm({ weight: '', chest: '', waist: '', arms: '', legs: '', notes: '' })
      setShowForm(false)
    } catch {}
  }

  const sorted = [...measurements].reverse()

  const chartData = {
    labels: sorted.map(m => new Date(m.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })),
    datasets: [
      { label: 'Peso (kg)', data: sorted.map(m => m.weight), borderColor: '#e94560', backgroundColor: '#e9456020', fill: true, tension: 0.3 },
      { label: 'Pecho (cm)', data: sorted.map(m => m.chest), borderColor: '#f5a623', backgroundColor: '#f5a62320', fill: true, tension: 0.3 },
      { label: 'Cintura (cm)', data: sorted.map(m => m.waist), borderColor: '#4ecca3', backgroundColor: '#4ecca320', fill: true, tension: 0.3 },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#ccc', boxWidth: 12, padding: 12 } },
      tooltip: { backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#ccc', borderColor: '#333', borderWidth: 1 },
    },
    scales: {
      x: { ticks: { color: '#666' }, grid: { color: '#ffffff08' } },
      y: { ticks: { color: '#666' }, grid: { color: '#ffffff08' } },
    },
  }

  const lastMeas = measurements[0]

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Evolución</h1>
            <p className="text-gray-400 text-sm mt-1">Seguí tu progreso físico</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadExport('measurements')}
              className="p-2 bg-gym-800 hover:bg-gym-700 border border-gym-700/50 rounded-lg text-gray-400 hover:text-white transition"
              title="Exportar mediciones a CSV"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                showForm
                  ? 'bg-gym-700 text-gray-300 hover:bg-gym-600'
                  : 'bg-gradient-to-r from-gym-400 to-orange-500 text-white shadow-lg shadow-gym-400/30 hover:from-red-500 hover:to-orange-600'
              }`}
            >
              {showForm ? 'Cancelar' : 'Nueva Medición'}
            </button>
          </div>
        </div>

        {lastMeas && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Peso', value: lastMeas.weight, unit: 'kg', color: 'from-gym-400 to-red-500' },
              { label: 'Pecho', value: lastMeas.chest, unit: 'cm', color: 'from-gym-300 to-amber-500' },
              { label: 'Cintura', value: lastMeas.waist, unit: 'cm', color: 'from-gym-200 to-emerald-400' },
              { label: 'Brazos', value: lastMeas.arms, unit: 'cm', color: 'from-blue-500 to-cyan-400' },
              { label: 'Piernas', value: lastMeas.legs, unit: 'cm', color: 'from-purple-500 to-pink-400' },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-center shadow-lg`}>
                <p className="text-xs text-white/80 font-medium">{stat.label}</p>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/60">{stat.unit}</p>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-6 mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'weight', label: 'Peso (kg)' },
              { key: 'chest', label: 'Pecho (cm)' },
              { key: 'waist', label: 'Cintura (cm)' },
              { key: 'arms', label: 'Brazos (cm)' },
              { key: 'legs', label: 'Piernas (cm)' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{f.label}</label>
                <input
                  type="number" step="0.1" value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white focus:outline-none focus:border-gym-400"
                />
              </div>
            ))}
            <div className="col-span-2 md:col-span-3">
              <label className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white focus:outline-none focus:border-gym-400 resize-none"
                rows={2}
              />
            </div>
            <div className="col-span-2 md:col-span-3">
              <button type="submit" className="bg-gradient-to-r from-gym-200 to-emerald-400 hover:from-emerald-400 hover:to-green-500 text-gym-900 px-6 py-2.5 rounded-lg font-bold transition shadow-lg">
                Guardar Medición
              </button>
            </div>
          </form>
        )}

        {measurements.length > 0 && (
          <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-6 mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        <div className="space-y-2">
          {measurements.map(m => (
            <div key={m.id} className="bg-gym-800/30 border border-gym-700/30 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gym-800/50 transition">
              <span className="text-gray-400 text-sm">
                {new Date(m.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              <div className="flex gap-3 text-sm">
                <span className="text-gym-400 font-bold">{m.weight} kg</span>
                <span className="text-gym-300">Pecho: {m.chest}</span>
                <span className="text-gym-200">Cintura: {m.waist}</span>
              </div>
            </div>
          ))}
          {measurements.length === 0 && (
            <p className="text-center text-gray-500 py-10">Aún no tenés mediciones registradas</p>
          )}
        </div>
      </div>
    </div>
  )
}
