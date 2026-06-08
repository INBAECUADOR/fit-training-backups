import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { getMeasurements, saveMeasurement, deleteMeasurement, downloadExport } from '../api'
import Navbar from '../components/Navbar'
import { Download, Trash2, Camera } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Evolution() {
  const [measurements, setMeasurements] = useState([])
  const [form, setForm] = useState({ weight: '', height: '', neck: '', shoulders: '', chest: '', waist: '', arms: '', legs: '', back: '', biceps: '', forearms: '', wrist: '', mid_abdomen: '', hips: '', thigh: '', mid_thigh: '', calf: '', notes: '' })
  const [showForm, setShowForm] = useState(false)
  const [photos, setPhotos] = useState({ photo1: null, photo2: null, photo3: null, photo4: null })
  const [photoPreviews, setPhotoPreviews] = useState({ photo1: '', photo2: '', photo3: '', photo4: '' })
  const [expandedPhoto, setExpandedPhoto] = useState(null)

  useEffect(() => {
    getMeasurements().then(setMeasurements).catch(() => {})
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    const fd = new FormData()
    const fields = ['weight','height','neck','shoulders','chest','waist','arms','legs','back','biceps','forearms','wrist','mid_abdomen','hips','thigh','mid_thigh','calf']
    fields.forEach(k => fd.append(k, parseFloat(form[k]) || 0))
    fd.append('notes', form.notes)
    if (photos.photo1) fd.append('photo1', photos.photo1)
    if (photos.photo2) fd.append('photo2', photos.photo2)
    if (photos.photo3) fd.append('photo3', photos.photo3)
    if (photos.photo4) fd.append('photo4', photos.photo4)
    try {
      await saveMeasurement(fd)
      const updated = await getMeasurements()
      setMeasurements(updated)
      const empty = Object.fromEntries(fields.map(k => [k, '']))
      setForm({ ...empty, notes: '' })
      setPhotos({ photo1: null, photo2: null, photo3: null, photo4: null })
      setPhotoPreviews({ photo1: '', photo2: '', photo3: '', photo4: '' })
      setShowForm(false)
    } catch {}
  }

  const handlePhoto = (field, file) => {
    setPhotos(p => ({ ...p, [field]: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreviews(prev => ({ ...prev, [field]: e.target.result }))
      reader.readAsDataURL(file)
    } else {
      setPhotoPreviews(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDeleteMeas = async (id) => {
    if (!confirm('¿Eliminar esta medición?')) return
    try { await deleteMeasurement(id); setMeasurements(prev => prev.filter(x => x.id !== id)) } catch {}
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

        {lastMeas && measurements.length >= 2 && (() => {
          const prev = measurements[measurements.length - 1]
          const curr = measurements[0]
          const compFields = [
            { key: 'shoulders', label: 'Hombros' }, { key: 'chest', label: 'Pecho' },
            { key: 'back', label: 'Espalda' }, { key: 'neck', label: 'Cuello' },
            { key: 'biceps', label: 'Bíceps' }, { key: 'forearms', label: 'Antebrazos' },
            { key: 'wrist', label: 'Muñeca' }, { key: 'mid_abdomen', label: 'Abdomen' },
            { key: 'waist', label: 'Cintura' }, { key: 'hips', label: 'Cadera' },
            { key: 'thigh', label: 'Pierna' }, { key: 'mid_thigh', label: 'Media Pierna' },
            { key: 'calf', label: 'Pantorrilla' }, { key: 'weight', label: 'Peso' },
          ]
          return (
            <div className="bg-gym-800/30 border border-gym-700/30 rounded-xl p-4 mb-6">
              <h3 className="text-xs font-bold text-gym-300 uppercase tracking-wider mb-3">Comparación</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <div className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] text-gray-600">Anterior</p>
                  <p className="text-xs text-gray-400 font-bold">{prev.date?.slice(0,10)}</p>
                </div>
                <div className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] text-gray-600">Actual</p>
                  <p className="text-xs text-gym-300 font-bold">{curr.date?.slice(0,10)}</p>
                </div>
                <div className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[10px] text-gray-600">Días</p>
                  <p className="text-xs text-white font-bold">{Math.round(Math.abs(new Date(curr.date) - new Date(prev.date)) / (1000*60*60*24))}</p>
                </div>
                {compFields.map(f => {
                  const pv = parseFloat(prev[f.key]) || 0; const cv = parseFloat(curr[f.key]) || 0; const diff = (cv - pv).toFixed(1)
                  return (
                    <div key={f.key} className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center border border-gym-700/20">
                      <p className="text-[10px] text-gray-500">{f.label}</p>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <span className="text-gray-500">{pv.toFixed(1)}</span>
                        <span className="text-gym-300 font-bold">→ {cv.toFixed(1)}</span>
                        <span className={`font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>{diff > 0 ? '+' : ''}{diff}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {lastMeas && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Peso', value: lastMeas.weight, unit: 'kg', color: 'from-gym-400 to-red-500' },
              { label: 'Hombros', value: lastMeas.shoulders, unit: 'cm', color: 'from-gym-300 to-amber-500' },
              { label: 'Pecho', value: lastMeas.chest, unit: 'cm', color: 'from-gym-200 to-emerald-400' },
              { label: 'Bíceps', value: lastMeas.biceps, unit: 'cm', color: 'from-blue-500 to-cyan-400' },
              { label: 'Pierna', value: lastMeas.thigh, unit: 'cm', color: 'from-purple-500 to-pink-400' },
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
            <form onSubmit={handleSubmit} className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-bold text-white mb-4">Nueva Medición</h3>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Generales</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ key: 'weight', label: 'Peso (kg)', step: '0.1' }, { key: 'height', label: 'Altura (cm)', step: '1' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step={f.step} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Torso Superior</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ key: 'shoulders', label: 'Hombros (cm)' }, { key: 'chest', label: 'Pecho (cm)' }, { key: 'back', label: 'Espalda (cm)' }, { key: 'neck', label: 'Cuello (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Brazos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[{ key: 'biceps', label: 'Bíceps (cm)' }, { key: 'forearms', label: 'Antebrazos (cm)' }, { key: 'wrist', label: 'Muñeca (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Torso Inferior</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[{ key: 'mid_abdomen', label: 'Abdomen Medio (cm)' }, { key: 'waist', label: 'Cintura (cm)' }, { key: 'hips', label: 'Cadera (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Piernas</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[{ key: 'thigh', label: 'Pierna (cm)' }, { key: 'mid_thigh', label: 'Media Pierna (cm)' }, { key: 'calf', label: 'Pantorrilla (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Fotos de Progreso</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ key: 'photo1', label: 'Foto Frontal' }, { key: 'photo2', label: 'Foto Espalda' }, { key: 'photo3', label: 'Foto Lateral' }, { key: 'photo4', label: 'Foto Pose' }].map(p => (
                    <div key={p.key}>
                      <label className="block text-xs text-gray-400 mb-1">{p.label}</label>
                      <label className="flex items-center gap-1.5 px-3 py-2 bg-gym-700 hover:bg-gym-600 text-gym-300 rounded-lg text-xs font-bold cursor-pointer transition w-full justify-center">
                        <Camera size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(p.key, e.target.files[0])} />
                      </label>
                      {photoPreviews[p.key] && <img src={photoPreviews[p.key]} alt={p.label} className="w-full aspect-[3/4] rounded-lg object-cover bg-gym-900 mt-2" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-400 mb-1">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400 resize-none" rows={2} />
              </div>

              <button type="submit" className="bg-gradient-to-r from-gym-200 to-emerald-400 hover:from-emerald-400 hover:to-green-500 text-gym-900 px-6 py-2.5 rounded-lg font-bold transition shadow-lg">
                Guardar Medición
              </button>
            </form>
        )}

        {measurements.length > 0 && (
          <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-6 mb-8">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        <div className="space-y-2">
          {measurements.map(m => (
            <div key={m.id} className="bg-gym-800/30 border border-gym-700/30 rounded-lg px-4 py-3 hover:bg-gym-800/50 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">
                  {new Date(m.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => handleDeleteMeas(m.id)} className="p-1.5 text-gray-400 hover:text-gym-400 transition" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
                <span className="text-gym-400 font-bold">{m.weight} kg</span>
                <span>Hombros: {m.shoulders}</span>
                <span>Pecho: {m.chest}</span>
                <span>Espalda: {m.back}</span>
                <span>Bíceps: {m.biceps}</span>
                <span>Abdomen: {m.mid_abdomen}</span>
                <span>Cintura: {m.waist}</span>
                <span>Cadera: {m.hips}</span>
                <span>Pierna: {m.thigh}</span>
                <span>Pantorrilla: {m.calf}</span>
              </div>
              {m.notes && <p className="text-xs text-gray-500 mt-1">{m.notes}</p>}
              {[m.photo1, m.photo2, m.photo3, m.photo4].filter(Boolean).length > 0 && (
                <div className="flex gap-2 mt-2">
                  {[m.photo1, m.photo2, m.photo3, m.photo4].map((p, i) => p && (
                    <img key={i} src={p} alt={`Foto ${i+1}`} className="w-16 h-20 rounded-lg object-cover bg-gym-900 cursor-pointer hover:opacity-80 transition" onClick={() => setExpandedPhoto(p)} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {measurements.length === 0 && (
            <p className="text-center text-gray-500 py-10">Aún no tenés mediciones registradas</p>
          )}
        </div>

        {expandedPhoto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setExpandedPhoto(null)}>
            <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <button onClick={() => setExpandedPhoto(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition text-lg font-bold">Cerrar ✕</button>
              <img src={expandedPhoto} alt="Progreso" className="w-full rounded-xl shadow-2xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
