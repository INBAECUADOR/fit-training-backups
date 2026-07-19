import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { getMeasurements, saveMeasurement, updateMeasurement, deleteMeasurement, downloadExport } from '../api'
import Navbar from '../components/Navbar'
import { SkeletonCard } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { Download, Trash2, Camera, Pencil, X } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

export default function Evolution() {
  const [measurements, setMeasurements] = useState(null)
  const [form, setForm] = useState({ weight: '', height: '', neck: '', shoulders: '', chest: '', waist: '', arms: '', legs: '', back: '', biceps: '', forearms: '', wrist: '', mid_abdomen: '', hips: '', thigh: '', mid_thigh: '', calf: '', notes: '' })
  const [showForm, setShowForm] = useState(false)
  const [photos, setPhotos] = useState({ photo1: null, photo2: null, photo3: null, photo4: null })
  const [photoPreviews, setPhotoPreviews] = useState({ photo1: '', photo2: '', photo3: '', photo4: '' })
  const [expandedPhoto, setExpandedPhoto] = useState(null)
  const [measDate, setMeasDate] = useState(new Date().toISOString().split('T')[0])
  const [editingId, setEditingId] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    getMeasurements()
      .then(setMeasurements)
      .catch(() => { setMeasurements([]); showToast('Error al cargar mediciones', 'error') })
  }, [])

  const handleEdit = (m) => {
    setEditingId(m.id)
    setForm({
      weight: String(m.weight || ''),
      height: String(m.height || ''),
      neck: String(m.neck || ''),
      shoulders: String(m.shoulders || ''),
      chest: String(m.chest || ''),
      waist: String(m.waist || ''),
      arms: String(m.arms || ''),
      legs: String(m.legs || ''),
      back: String(m.back || ''),
      biceps: String(m.biceps || ''),
      forearms: String(m.forearms || ''),
      wrist: String(m.wrist || ''),
      mid_abdomen: String(m.mid_abdomen || ''),
      hips: String(m.hips || ''),
      thigh: String(m.thigh || ''),
      mid_thigh: String(m.mid_thigh || ''),
      calf: String(m.calf || ''),
      notes: m.notes || '',
    })
    setMeasDate(m.date?.slice(0, 10) || new Date().toISOString().split('T')[0])
    setPhotos({ photo1: null, photo2: null, photo3: null, photo4: null })
    setPhotoPreviews({ photo1: m.photo1 || '', photo2: m.photo2 || '', photo3: m.photo3 || '', photo4: m.photo4 || '' })
    setShowForm(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('date', measDate)
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    Object.entries(photos).forEach(([k, v]) => { if (v) fd.append(k, v) })
    try {
      if (editingId) {
        await updateMeasurement(editingId, fd)
        showToast('Medición actualizada', 'success')
      } else {
        await saveMeasurement(fd)
        showToast('Medición guardada', 'success')
      }
      const updated = await getMeasurements()
      setMeasurements(updated)
      setShowForm(false)
      setEditingId(null)
      setForm({ weight: '', height: '', neck: '', shoulders: '', chest: '', waist: '', arms: '', legs: '', back: '', biceps: '', forearms: '', wrist: '', mid_abdomen: '', hips: '', thigh: '', mid_thigh: '', calf: '', notes: '' })
      setPhotos({ photo1: null, photo2: null, photo3: null, photo4: null })
      setPhotoPreviews({ photo1: '', photo2: '', photo3: '', photo4: '' })
    } catch { showToast('Error al guardar medición', 'error') }
  }

  const handleDelete = async id => {
    if (!confirm('¿Eliminar esta medición?')) return
    try {
      await deleteMeasurement(id)
      const updated = await getMeasurements()
      setMeasurements(updated)
      showToast('Medición eliminada', 'success')
    } catch { showToast('Error al eliminar medición', 'error') }
  }

  const handlePhoto = (key, file) => {
    setPhotos(p => ({ ...p, [key]: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = e => setPhotoPreviews(pp => ({ ...pp, [key]: e.target.result }))
      reader.readAsDataURL(file)
    } else {
      setPhotoPreviews(pp => ({ ...pp, [key]: '' }))
    }
  }

  if (measurements === null) {
    return (
      <div className="min-h-screen bg-gym-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date))
  const chartConfig = (label, key, color) => ({
    labels: sorted.map(m => new Date(m.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })),
    datasets: [{
      label, data: sorted.map(m => m[key] || 0), borderColor: color, backgroundColor: color + '20',
      fill: true, tension: 0.3, pointRadius: 3, pointHoverRadius: 6,
    }]
  })
  const chartOpts = (unit) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} ${unit}` } } },
    scales: { x: { ticks: { color: '#666', maxTicksLimit: 10 } }, y: { ticks: { color: '#666' } } }
  })

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-4xl mx-auto px-4 py-8">
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Evolución</h1>
            <p className="text-gray-400 text-sm mt-1">Mediciones corporales y fotos de progreso</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadExport('measurements')} className="p-2 bg-gym-800 hover:bg-gym-700 border border-gym-700/50 rounded-lg text-gray-400 hover:text-white transition-all" title="Exportar a CSV">
              <Download size={16} />
            </button>
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ weight: '', height: '', neck: '', shoulders: '', chest: '', waist: '', arms: '', legs: '', back: '', biceps: '', forearms: '', wrist: '', mid_abdomen: '', hips: '', thigh: '', mid_thigh: '', calf: '', notes: '' }); setMeasDate(new Date().toISOString().split('T')[0]); setPhotos({ photo1: null, photo2: null, photo3: null, photo4: null }); setPhotoPreviews({ photo1: '', photo2: '', photo3: '', photo4: '' }) }} className="px-4 py-2 bg-gradient-to-r from-gym-400 to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all">
              Nueva medición
            </button>
          </div>
        </motion.div>

        {measurements.length === 0 && !showForm && (
          <motion.div variants={fadeUp} className="text-center py-20 bg-gym-800/30 border border-gym-700/30 rounded-2xl">
            <Camera size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-semibold mb-1">Aún no tienes mediciones</p>
            <p className="text-gray-600 text-sm mb-4">Registra tu peso, medidas y fotos para ver tu evolución</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              Registrar primera medición
            </button>
          </motion.div>
        )}

        {showForm && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-gradient-to-r from-gym-800/80 to-gym-900/80 border border-gym-700/30 rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {editingId ? 'Editar medición' : 'Nueva medición'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1">Fecha</label>
                <input type="date" value={measDate} onChange={e => setMeasDate(e.target.value)} required className="w-full sm:w-56 px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400 focus:ring-1 focus:ring-gym-400/30 transition-all" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { key: 'weight', label: 'Peso (kg)', type: 'number' },
                  { key: 'height', label: 'Altura (cm)', type: 'number' },
                  { key: 'neck', label: 'Cuello (cm)', type: 'number' },
                  { key: 'shoulders', label: 'Hombros (cm)', type: 'number' },
                  { key: 'chest', label: 'Pecho (cm)', type: 'number' },
                  { key: 'waist', label: 'Cintura (cm)', type: 'number' },
                  { key: 'arms', label: 'Brazos (cm)', type: 'number' },
                  { key: 'legs', label: 'Piernas (cm)', type: 'number' },
                  { key: 'back', label: 'Espalda (cm)', type: 'number' },
                  { key: 'biceps', label: 'Bíceps (cm)', type: 'number' },
                  { key: 'forearms', label: 'Antebrazos (cm)', type: 'number' },
                  { key: 'wrist', label: 'Muñeca (cm)', type: 'number' },
                  { key: 'mid_abdomen', label: 'Abdomen (cm)', type: 'number' },
                  { key: 'hips', label: 'Cadera (cm)', type: 'number' },
                  { key: 'thigh', label: 'Muslo (cm)', type: 'number' },
                  { key: 'mid_thigh', label: 'Muslo medio (cm)', type: 'number' },
                  { key: 'calf', label: 'Pantorrilla (cm)', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-gray-500 font-medium mb-0.5">{f.label}</label>
                    <input type={f.type} step="0.1" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-2.5 py-1.5 bg-gym-900 border border-gym-700 rounded-lg text-white text-xs focus:outline-none focus:border-gym-400 transition-all" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['photo1','photo2','photo3','photo4'].map((key, i) => (
                  <div key={key}>
                    <label className="block text-[10px] text-gray-500 font-medium mb-1">Foto {i + 1}</label>
                    {photoPreviews[key] ? (
                      <div className="relative">
                        <img src={photoPreviews[key]} alt={`Foto ${i + 1}`} className="w-full aspect-[3/4] object-cover rounded-lg border border-gym-700" />
                        <button type="button" onClick={() => handlePhoto(key, null)} className="absolute top-1 right-1 p-1 bg-gym-900/80 rounded-full text-gray-400 hover:text-white transition">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[3/4] bg-gym-900 border border-dashed border-gym-700 rounded-lg cursor-pointer hover:border-gym-500 transition-all">
                        <Camera size={20} className="text-gray-500 mb-1" />
                        <span className="text-[10px] text-gray-600">Agregar foto</span>
                        <input type="file" accept="image/*" onChange={e => handlePhoto(key, e.target.files?.[0])} className="hidden" />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1">Notas</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gym-400 transition-all resize-none" placeholder="Observaciones..." />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  {editingId ? 'Actualizar' : 'Guardar medición'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="btn-ghost text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {sorted.length > 1 && ['weight','chest','waist','arms'].filter(k => sorted.some(m => m[k] > 0)).map(k => (
            <motion.div key={k} variants={fadeUp} className="bg-gym-800/50 border border-gym-700/30 rounded-2xl p-4">
              <div className="h-48">
                <Line data={chartConfig({ weight: 'Peso', chest: 'Pecho', waist: 'Cintura', arms: 'Brazos' }[k], k, { weight: '#f59e0b', chest: '#ef4444', waist: '#3b82f6', arms: '#22c55e' }[k])} options={chartOpts({ weight: 'kg', chest: 'cm', waist: 'cm', arms: 'cm' }[k])} />
              </div>
            </motion.div>
          ))}
        </div>

        {measurements.length > 0 && (
          <motion.div variants={fadeUp} className="space-y-3">
            <h2 className="text-lg font-bold text-white mb-4">Historial de mediciones</h2>
            {[...measurements].sort((a, b) => new Date(b.date) - new Date(a.date)).map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-gym-800/50 border border-gym-700/30 rounded-xl p-4 hover:bg-gym-800/70 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">
                    {new Date(m.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(m)} className="p-1.5 text-gray-500 hover:text-gym-300 transition" title="Editar"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  {m.weight > 0 && <span className="font-bold text-gym-300">{m.weight} kg <span className="font-normal text-gray-500">peso</span></span>}
                  {m.chest > 0 && <span className="font-bold text-white">{m.chest} cm <span className="font-normal text-gray-500">pecho</span></span>}
                  {m.waist > 0 && <span className="font-bold text-white">{m.waist} cm <span className="font-normal text-gray-500">cintura</span></span>}
                  {m.arms > 0 && <span className="font-bold text-white">{m.arms} cm <span className="font-normal text-gray-500">brazos</span></span>}
                  {m.legs > 0 && <span className="font-bold text-white">{m.legs} cm <span className="font-normal text-gray-500">piernas</span></span>}
                </div>
                {m.photo1 && (
                  <div className="flex gap-2 mt-2">
                    {[m.photo1, m.photo2, m.photo3, m.photo4].filter(Boolean).map((p, pi) => (
                      <button key={pi} onClick={() => setExpandedPhoto(p)} className="shrink-0">
                        <img src={p} alt={`Foto ${pi + 1}`} className="w-16 h-20 object-cover rounded-lg border border-gym-700 hover:border-gym-400 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {expandedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 fade-in-up" onClick={() => setExpandedPhoto(null)}>
            <img src={expandedPhoto} alt="Foto expandida" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
          </div>
        )}
      </motion.div>
    </div>
  )
}
