import React, { useState, useEffect } from 'react'
import {
  adminGetRoutineTemplates, adminGetRoutineTemplate, adminCreateRoutineTemplate,
  adminUpdateRoutineTemplate, adminDeleteRoutineTemplate, adminAssignRoutineTemplate,
  adminGetUsers,
} from '../api'
import { Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp, Layers, UserCheck } from 'lucide-react'
import { useToast } from '../components/Toast'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function AdminRoutineTemplates() {
  const { showToast } = useToast()
  const [templates, setTemplates] = useState([])
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [templateExercises, setTemplateExercises] = useState([])
  const [assignUserId, setAssignUserId] = useState('')
  const [assigningId, setAssigningId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [exercises, setExercises] = useState([])
  const [selectedDay, setSelectedDay] = useState('Lunes')

  useEffect(() => {
    loadTemplates()
    adminGetUsers().then(setUsers).catch(() => showToast('Error al cargar usuarios', 'error'))
  }, [])

  const loadTemplates = () => {
    adminGetRoutineTemplates().then(setTemplates).catch(() => showToast('Error al cargar plantillas', 'error'))
  }

  const loadTemplateDetail = async (id) => {
    try {
      const t = await adminGetRoutineTemplate(id)
      setTemplateExercises(t.exercises || [])
    } catch { showToast('Error al cargar ejercicios de plantilla', 'error') }
  }

  const toggleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); setTemplateExercises([]); return }
    setExpandedId(id)
    loadTemplateDetail(id)
  }

  const resetForm = () => {
    setForm({ name: '', description: '' })
    setExercises([])
    setSelectedDay('Lunes')
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = async (t) => {
    setForm({ name: t.name, description: t.description })
    setEditingId(t.id)
    setShowForm(true)
    try {
      const detail = await adminGetRoutineTemplate(t.id)
      setExercises(detail.exercises || [])
    } catch { setExercises([]) }
  }

  const addExercise = () => {
    setExercises(prev => [...prev, {
      id: Date.now(),
      day_name: selectedDay,
      name: '',
      series: 0,
      reps: 0,
      rest: '',
      observation: '',
      gif_url: '',
    }])
  }

  const updateExercise = (idx, field, value) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex))
  }

  const removeExercise = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('El nombre es requerido', 'error'); return }
    const payload = { ...form, exercises: exercises.filter(e => e.name.trim()) }
    try {
      if (editingId) {
        await adminUpdateRoutineTemplate(editingId, payload)
        showToast('Plantilla actualizada', 'success')
      } else {
        await adminCreateRoutineTemplate(payload)
        showToast('Plantilla creada', 'success')
      }
      setShowForm(false)
      resetForm()
      loadTemplates()
    } catch { showToast('Error al guardar plantilla', 'error') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta plantilla definitivamente?')) return
    try {
      await adminDeleteRoutineTemplate(id)
      showToast('Plantilla eliminada', 'success')
      if (expandedId === id) { setExpandedId(null); setTemplateExercises([]) }
      loadTemplates()
    } catch { showToast('Error al eliminar plantilla', 'error') }
  }

  const handleAssign = async (templateId) => {
    if (!assignUserId) { showToast('Seleccioná un usuario', 'error'); return }
    setAssigningId(templateId)
    try {
      const res = await adminAssignRoutineTemplate(templateId, parseInt(assignUserId))
      showToast(res.message || 'Plantilla asignada', 'success')
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al asignar plantilla'
      showToast(msg, 'error')
    }
    setAssigningId(null)
    setAssignUserId('')
  }

  const dayExercises = exercises.filter(e => e.day_name === selectedDay)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers size={20} /> Plantillas de Rutinas
        </h2>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition"
        >
          <Plus size={16} /> Nueva Plantilla
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gym-800/60 border border-gym-700/50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre de la plantilla" className="px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción (opcional)" className="px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
          </div>

          {/* Day selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {DAY_NAMES.map(day => (
              <button key={day} onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-gym-400 text-white'
                    : 'bg-gym-700 text-gray-400 hover:bg-gym-600'
                }`}>{day}</button>
            ))}
          </div>

          {/* Exercises for selected day */}
          <div className="space-y-2 mb-4">
            {dayExercises.length === 0 && (
              <p className="text-gray-500 text-sm">Sin ejercicios para {selectedDay}</p>
            )}
            {dayExercises.map((ex, idx) => {
              const globalIdx = exercises.findIndex(e => e.id === ex.id)
              return (
                <div key={ex.id} className="bg-gym-900/60 border border-gym-700/50 rounded-lg p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <input value={ex.name} onChange={e => updateExercise(globalIdx, 'name', e.target.value)}
                      placeholder="Ejercicio" className="col-span-2 px-2 py-1 bg-gym-800 border border-gym-700 rounded text-white text-xs" />
                    <input value={ex.series || ''} onChange={e => updateExercise(globalIdx, 'series', e.target.value)}
                      placeholder="Series" type="number" className="px-2 py-1 bg-gym-800 border border-gym-700 rounded text-white text-xs" />
                    <input value={ex.reps || ''} onChange={e => updateExercise(globalIdx, 'reps', e.target.value)}
                      placeholder="Reps" type="number" className="px-2 py-1 bg-gym-800 border border-gym-700 rounded text-white text-xs" />
                    <input value={ex.rest || ''} onChange={e => updateExercise(globalIdx, 'rest', e.target.value)}
                      placeholder="Descanso" className="px-2 py-1 bg-gym-800 border border-gym-700 rounded text-white text-xs" />
                    <input value={ex.gif_url || ''} onChange={e => updateExercise(globalIdx, 'gif_url', e.target.value)}
                      placeholder="GIF URL" className="px-2 py-1 bg-gym-800 border border-gym-700 rounded text-white text-xs" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input value={ex.observation || ''} onChange={e => updateExercise(globalIdx, 'observation', e.target.value)}
                      placeholder="Observación" className="flex-1 px-2 py-1 bg-gym-800 border border-gym-700 rounded text-white text-xs" />
                    <button onClick={() => removeExercise(globalIdx)}
                      className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition"><X size={14} /></button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={addExercise}
              className="flex items-center gap-1 px-3 py-1.5 bg-gym-700 text-gray-300 rounded-lg text-xs font-bold hover:bg-gym-600 transition">
              <Plus size={14} /> Agregar ejercicio
            </button>
            <div className="flex-1" />
            <button onClick={() => { setShowForm(false); resetForm() }}
              className="px-3 py-1.5 bg-gym-700 text-gray-400 rounded-lg text-xs font-bold hover:bg-gym-600 transition">Cancelar</button>
            <button onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 bg-gym-400 text-gym-900 rounded-lg text-xs font-bold hover:bg-green-400 transition">
              <Save size={14} /> {editingId ? 'Actualizar' : 'Crear'} Plantilla
            </button>
          </div>
        </div>
      )}

      {/* Template list */}
      <div className="space-y-3">
        {templates.map(t => {
          const isExpanded = expandedId === t.id
          const dayExs = isExpanded ? templateExercises : []
          const dayGroups = {}
          dayExs.forEach(ex => {
            if (!dayGroups[ex.day_name]) dayGroups[ex.day_name] = []
            dayGroups[ex.day_name].push(ex)
          })

          return (
            <div key={t.id} className="bg-gym-800/40 border border-gym-700/40 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                  <h3 className="text-white font-bold">{t.name}</h3>
                  {t.description && <p className="text-gray-400 text-xs mt-0.5">{t.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(t)}
                    className="p-1.5 bg-gym-700 text-gray-400 rounded-lg hover:text-gym-200 transition"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(t.id)}
                    className="p-1.5 bg-gym-700 text-gray-400 rounded-lg hover:text-red-400 transition"><Trash2 size={14} /></button>
                  <button onClick={() => toggleExpand(t.id)}
                    className="p-1.5 bg-gym-700 text-gray-400 rounded-lg hover:text-gym-200 transition">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Assign section */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <select value={assignUserId || ''} onChange={e => setAssignUserId(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-gym-900 border border-gym-700 rounded-lg text-white text-xs">
                  <option value="">Asignar a usuario...</option>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.document_id})</option>
                  ))}
                </select>
                <button onClick={() => handleAssign(t.id)} disabled={assigningId === t.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gym-600 text-gray-300 rounded-lg text-xs font-bold hover:bg-gym-500 transition disabled:opacity-50">
                  <UserCheck size={14} /> {assigningId === t.id ? '...' : 'Asignar'}
                </button>
              </div>

              {/* Expanded exercises */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gym-700/40 pt-3">
                  {Object.keys(dayGroups).length === 0 && (
                    <p className="text-gray-500 text-sm">Sin ejercicios en esta plantilla</p>
                  )}
                  {Object.entries(dayGroups).map(([day, exs]) => (
                    <div key={day} className="mb-3">
                      <h4 className="text-gym-300 font-bold text-xs uppercase tracking-wider mb-1.5">{day}</h4>
                      <div className="space-y-1">
                        {exs.map((ex, i) => (
                          <div key={i} className="bg-gym-900/50 rounded-lg px-3 py-2 flex items-center gap-3">
                            <span className="flex-1 text-white text-sm">{ex.name}</span>
                            <span className="text-gray-400 text-xs">{ex.series}x{ex.reps}</span>
                            {ex.rest && <span className="text-gray-500 text-xs">({ex.rest})</span>}
                            {ex.observation && <span className="text-gray-500 text-xs italic">{ex.observation}</span>}
                            {ex.gif_url && (
                              <img src={ex.gif_url} alt="" className="w-8 h-8 rounded object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {templates.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay plantillas aún. Creá la primera.</p>
        )}
      </div>
    </div>
  )
}
