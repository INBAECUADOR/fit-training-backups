import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import {
  adminGetExercises, adminCreateExercise, adminUpdateExercise, adminDeleteExercise,
  adminGetRoutines, adminUpdateRoutine,
  adminGetGlobalExercises, adminCreateGlobalExercise, adminUpdateGlobalExercise, adminDeleteGlobalExercise,
  adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
  getDiet, saveDiet,
  getMeasurements, saveMeasurement,
} from '../api'
import { Plus, Pencil, Trash2, Save, X, Dumbbell, ChevronDown, ChevronUp, Utensils, TrendingUp, ExternalLink, Search, Globe, BookOpen, Users as UsersIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const MEAL_TIMES = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'morning_snack', label: 'Snack Mañana' },
  { key: 'lunch', label: 'Almuerzo' },
  { key: 'afternoon_snack', label: 'Snack Tarde' },
  { key: 'dinner', label: 'Cena' },
]
const DIET_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('exercises')

  // --- User selector ---
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)

  // --- Exercises ---
  const [routines, setRoutines] = useState([])
  const [exercises, setExercises] = useState([])
  const [selectedDay, setSelectedDay] = useState('Lunes')
  const [editingExercise, setEditingExercise] = useState(null)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', series: '', reps: '', observation: '', gif_url: '', global_exercise_id: null })
  const [expandedDays, setExpandedDays] = useState(DAYS.reduce((a, d) => ({ ...a, [d]: true }), {}))

  // --- Diet ---
  const [meals, setMeals] = useState({})
  const [dietDay, setDietDay] = useState('Lunes')
  const [dietSaving, setDietSaving] = useState(false)
  const [dietSaved, setDietSaved] = useState(false)

  // --- Measurements ---
  const [measurements, setMeasurements] = useState([])
  const [measForm, setMeasForm] = useState({ weight: '', chest: '', waist: '', arms: '', legs: '', notes: '' })
  const [measSaving, setMeasSaving] = useState(false)
  const [measSaved, setMeasSaved] = useState(false)

  // --- Global Catalog ---
  const [globalExercises, setGlobalExercises] = useState([])
  const [catalogSearch, setCatalogSearch] = useState('')
  const [catalogGroup, setCatalogGroup] = useState('')
  const [showGlobalForm, setShowGlobalForm] = useState(false)
  const [globalForm, setGlobalForm] = useState({ name: '', muscle_group: '', description: '', gif_url: '' })
  const [editingGlobal, setEditingGlobal] = useState(null)
  const [showGlobalPicker, setShowGlobalPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerGroup, setPickerGroup] = useState('')

  // --- Exercise form extended ---
  const [globalPickerExercises, setGlobalPickerExercises] = useState([])

  const loadUserData = (userId) => {
    const params = userId ? { user_id: userId } : {}
    adminGetRoutines({ params }).then(setRoutines).catch(() => {})
    adminGetExercises({ params }).then(setExercises).catch(() => {})
    getDiet(params).then(setMeals).catch(() => {})
    getMeasurements(params).then(setMeasurements).catch(() => {})
  }

  useEffect(() => {
    adminGetUsers().then(list => { setUsers(list); if (list.length > 0) setSelectedUserId(list[0].id) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedUserId) loadUserData(selectedUserId)
  }, [selectedUserId])

  const loadGlobalCatalog = (search, group) => {
    const params = {}
    if (search) params.search = search
    if (group) params.group = group
    adminGetGlobalExercises(params).then(setGlobalExercises).catch(() => {})
  }

  // --- Exercise handlers ---
  const filtered = exercises.filter(e => e.day_name === selectedDay)
  const routineLabel = routines.find(r => r.day_name === selectedDay)?.day_label || ''

  const handleEditRoutine = async () => {
    const routine = routines.find(r => r.day_name === selectedDay)
    if (!routine) return
    try {
      await adminUpdateRoutine(routine.id, { day_label: editingRoutine })
      setRoutines(await adminGetRoutines())
      setEditingRoutine(null)
    } catch {}
  }

  const resetForm = () => setForm({ name: '', series: '', reps: '', observation: '', gif_url: '', global_exercise_id: null })

  const handleSaveExercise = async () => {
    const routine = routines.find(r => r.day_name === selectedDay)
    if (!routine) return
    try {
      const payload = {
        ...form,
        routine_id: routine.id,
        series: parseInt(form.series) || 0,
        reps: parseInt(form.reps) || 0,
        global_exercise_id: form.global_exercise_id || null,
      }
      if (editingExercise) {
        await adminUpdateExercise(editingExercise.id, payload)
      } else {
        await adminCreateExercise(payload)
      }
      setExercises(await adminGetExercises())
      setShowForm(false)
      setEditingExercise(null)
      resetForm()
    } catch {}
  }

  const pickFromCatalog = (ex) => {
    setForm(prev => ({ ...prev, name: ex.name, gif_url: ex.gif_url || prev.gif_url, global_exercise_id: ex.id }))
    setShowGlobalPicker(false)
    setPickerSearch('')
    setPickerGroup('')
  }

  const loadPicker = (search, group) => {
    const params = {}
    if (search) params.search = search
    if (group) params.group = group
    adminGetGlobalExercises(params).then(setGlobalPickerExercises).catch(() => {})
  }

  const handleEdit = (ex) => {
    setEditingExercise(ex)
    setForm({ name: ex.name, series: String(ex.series), reps: String(ex.reps), observation: ex.observation || '', gif_url: ex.gif_url || '' })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este ejercicio? También se borrarán sus resultados.')) return
    try {
      await adminDeleteExercise(id)
      setExercises(prev => prev.filter(e => e.id !== id))
    } catch {}
  }

  const toggleDay = (day) => setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }))

  // --- Diet handlers ---
  const updateMeal = (day, mealKey, value) => {
    setMeals(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [mealKey]: value } }))
  }

  const userParams = selectedUserId ? { user_id: selectedUserId } : {}

  const handleSaveDiet = async () => {
    setDietSaving(true)
    try {
      await saveDiet(meals, userParams)
      getDiet(userParams).then(setMeals).catch(() => {})
      setDietSaved(true)
      setTimeout(() => setDietSaved(false), 2000)
    } catch {} finally {
      setDietSaving(false)
    }
  }

  // --- Measurement handlers ---
  const handleSaveMeas = async (e) => {
    e.preventDefault()
    setMeasSaving(true)
    try {
      await saveMeasurement({
        weight: parseFloat(measForm.weight) || 0,
        chest: parseFloat(measForm.chest) || 0,
        waist: parseFloat(measForm.waist) || 0,
        arms: parseFloat(measForm.arms) || 0,
        legs: parseFloat(measForm.legs) || 0,
        notes: measForm.notes,
      }, userParams)
      getMeasurements(userParams).then(setMeasurements).catch(() => {})
      setMeasSaved(true)
      setMeasForm({ weight: '', chest: '', waist: '', arms: '', legs: '', notes: '' })
      setTimeout(() => setMeasSaved(false), 2000)
    } catch {} finally {
      setMeasSaving(false)
    }
  }

  // --- User CRUD ---
  const [userForm, setUserForm] = useState({ document_id: '', email: '', name: '', password: '' })
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)

  const resetUserForm = () => setUserForm({ document_id: '', email: '', name: '', password: '' })

  const handleSaveUser = async () => {
    try {
      if (editingUserId) {
        const payload = { ...userForm }
        if (!payload.password) delete payload.password
        await adminUpdateUser(editingUserId, payload)
      } else {
        await adminCreateUser(userForm)
      }
      const list = await adminGetUsers()
      setUsers(list)
      resetUserForm()
      setShowUserForm(false)
      setEditingUserId(null)
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al guardar usuario')
    }
  }

  const handleEditUser = (u) => {
    setUserForm({ document_id: u.document_id, email: u.email || '', name: u.name, password: '' })
    setEditingUserId(u.id)
    setShowUserForm(true)
  }

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`¿Eliminar a "${name}" y todos sus datos?`)) return
    try {
      await adminDeleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* User selector */}
        <div className="mb-4 flex items-center gap-3 bg-gym-800 p-3 rounded-xl">
          <label className="font-medium text-gray-300 text-sm whitespace-nowrap">Usuario:</label>
          <select
            className="flex-1 border border-gym-700 rounded-lg px-3 py-2 bg-gym-900 text-white text-sm"
            value={selectedUserId || ''}
            onChange={e => setSelectedUserId(parseInt(e.target.value))}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.document_id}){u.role === 'admin' ? ' 👑' : ''}
              </option>
            ))}
            {users.length === 0 && <option value="">Cargando...</option>}
          </select>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-6">
          {users.find(u => u.id === selectedUserId)?.name || 'Administración'}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'exercises', label: 'Ejercicios', icon: Dumbbell },
            { key: 'diet', label: 'Dietas', icon: Utensils },
            { key: 'measurements', label: 'Medidas', icon: TrendingUp },
            { key: 'users', label: 'Usuarios', icon: UsersIcon },
            { key: 'catalog', label: 'Catálogo', icon: BookOpen },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                tab === t.key
                  ? 'bg-gradient-to-r from-gym-400 to-orange-500 text-white shadow-lg'
                  : 'bg-gym-800 text-gray-400 hover:bg-gym-700'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* ======== TAB: EXERCISES ======== */}
        {tab === 'exercises' && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {DAYS.map(day => (
                <button key={day} onClick={() => { setSelectedDay(day); setShowForm(false); setEditingExercise(null) }}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                    selectedDay === day
                      ? 'bg-gradient-to-r from-gym-400 to-orange-500 text-white shadow-lg'
                      : 'bg-gym-800 text-gray-400 hover:bg-gym-700'
                  }`}>{day}</button>
              ))}
            </div>

            <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-4 mb-6 flex items-center justify-between">
              {editingRoutine !== null ? (
                <div className="flex items-center gap-2 flex-1">
                  <input value={editingRoutine} onChange={e => setEditingRoutine(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" autoFocus />
                  <button onClick={handleEditRoutine} className="p-1.5 bg-gym-200 text-gym-900 rounded-lg hover:bg-green-400 transition"><Save size={14} /></button>
                  <button onClick={() => setEditingRoutine(null)} className="p-1.5 bg-gym-700 text-gray-400 rounded-lg hover:text-white transition"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-bold text-gym-300">{routineLabel || selectedDay}</span>
                  <button onClick={() => setEditingRoutine(routineLabel)} className="p-1.5 text-gray-400 hover:text-white transition" title="Editar etiqueta"><Pencil size={14} /></button>
                </>
              )}
            </div>

            <div className="space-y-2 mb-6">
              {filtered.map(ex => (
                <div key={ex.id} className="bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gym-800/70 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">{ex.name}</p>
                    <p className="text-xs text-gray-500">{ex.series} series x {ex.reps} reps {ex.observation ? `· ${ex.observation}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button onClick={() => handleEdit(ex)} className="p-1.5 text-gray-400 hover:text-gym-300 transition" title="Editar"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(ex.id)} className="p-1.5 text-gray-400 hover:text-gym-400 transition" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && !showForm && <p className="text-center text-gray-500 py-6">No hay ejercicios para este día</p>}
            </div>

            {showForm ? (
              <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-5 mb-6">
                <h3 className="text-sm font-bold text-white mb-4">{editingExercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h3>

                {!editingExercise && (
                  <div className="mb-4">
                    <button onClick={() => { setShowGlobalPicker(true); loadPicker('', '') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gym-700 hover:bg-gym-600 text-gym-300 rounded-lg text-xs font-bold transition">
                      <Search size={12} /> Seleccionar del catálogo global
                    </button>
                    {form.global_exercise_id && (
                      <span className="text-xs text-gym-200 ml-2">✓ Ejercicio del catálogo</span>
                    )}
                  </div>
                )}

                {/* Global picker modal */}
                {showGlobalPicker && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowGlobalPicker(false)}>
                    <div className="bg-gym-800 border border-gym-700 rounded-2xl p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <h4 className="text-white font-bold text-sm mb-3">Seleccionar del catálogo</h4>
                      <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input value={pickerSearch} onChange={e => { setPickerSearch(e.target.value); loadPicker(e.target.value, pickerGroup) }}
                            className="w-full pl-8 pr-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Buscar ejercicio..." />
                        </div>
                        <select value={pickerGroup} onChange={e => { setPickerGroup(e.target.value); loadPicker(pickerSearch, e.target.value) }}
                          className="px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400">
                          <option value="">Todos</option>
                          {['Pecho','Espalda','Piernas','Hombros','Bíceps','Tríceps','Abdominales','Glúteos','Trapecio','Antebrazos','Cardio','Compuestos'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {globalPickerExercises.map(ex => (
                          <button key={ex.id} onClick={() => pickFromCatalog(ex)}
                            className="w-full text-left px-3 py-2 bg-gym-900/50 hover:bg-gym-700 rounded-lg transition flex items-center justify-between">
                            <span className="text-sm text-white">{ex.name}</span>
                            <span className="text-[10px] text-gray-500">{ex.muscle_group}</span>
                          </button>
                        ))}
                        {globalPickerExercises.length === 0 && <p className="text-center text-gray-500 text-sm py-4">Sin resultados</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nombre</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Series</label>
                    <input type="number" value={form.series} onChange={e => setForm({ ...form, series: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Reps</label>
                    <input type="number" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Observación</label>
                    <input value={form.observation} onChange={e => setForm({ ...form, observation: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">GIF URL (UUID)</label>
                    <input value={form.gif_url} onChange={e => setForm({ ...form, gif_url: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400"
                      placeholder="ej: c708853b-5afd-4fce-9e39-a5f7c335206b" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveExercise}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-lg font-bold text-sm transition hover:from-emerald-400 hover:to-green-500">
                    <Save size={14} /> {editingExercise ? 'Actualizar' : 'Crear'}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditingExercise(null); resetForm() }}
                    className="px-4 py-2 bg-gym-700 text-gray-300 rounded-lg font-bold text-sm transition hover:bg-gym-600">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { resetForm(); setShowForm(true); setEditingExercise(null) }}
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gym-700/50 rounded-xl text-gray-400 hover:text-white hover:border-gym-500 transition font-bold text-sm mb-6">
                <Plus size={16} /> Agregar ejercicio
              </button>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-bold text-white mb-4">Vista general</h2>
              <div className="space-y-2">
                {DAYS.map(day => {
                  const dayExercises = exercises.filter(e => e.day_name === day)
                  const label = routines.find(r => r.day_name === day)?.day_label
                  return (
                    <div key={day} className="bg-gym-800/30 border border-gym-700/30 rounded-xl overflow-hidden">
                      <button onClick={() => toggleDay(day)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gym-800/50 transition">
                        <div>
                          <span className="text-sm font-bold text-white">{day}</span>
                          {label && <span className="text-xs text-gray-500 ml-2">— {label}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{dayExercises.length} ejercicios</span>
                          {expandedDays[day] ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                        </div>
                      </button>
                      {expandedDays[day] && dayExercises.length > 0 && (
                        <div className="px-4 pb-3 space-y-1">
                          {dayExercises.map(ex => (
                            <div key={ex.id} className="flex items-center justify-between py-1">
                              <span className="text-xs text-gray-400">{ex.name}</span>
                              <span className="text-xs text-gray-600">{ex.series}x{ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* ======== TAB: DIET ======== */}
        {tab === 'diet' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">Gestioná el plan de alimentación</p>
              <div className="flex gap-2">
                <button onClick={handleSaveDiet} disabled={dietSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition shadow-lg ${
                    dietSaved ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 hover:from-emerald-400 hover:to-green-500'
                  }`}>
                  <Save size={16} /> {dietSaving ? 'Guardando...' : dietSaved ? 'Guardado' : 'Guardar'}
                </button>
                <button onClick={() => navigate('/diet')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gym-700 text-gray-300 rounded-xl font-bold text-sm hover:bg-gym-600 transition">
                  <ExternalLink size={14} /> Ver página
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {DIET_DAYS.map(day => (
                <button key={day} onClick={() => setDietDay(day)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                    dietDay === day
                      ? 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 shadow-lg'
                      : 'bg-gym-800 text-gray-400 hover:bg-gym-700'
                  }`}>{day}</button>
              ))}
            </div>

            <div className="space-y-4">
              {MEAL_TIMES.map(mt => (
                <div key={mt.key} className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-4 hover:border-gym-600 transition">
                  <label className="block text-sm font-bold text-gym-200 mb-2">{mt.label}</label>
                  <textarea value={meals[dietDay]?.[mt.key] || ''} onChange={e => updateMeal(dietDay, mt.key, e.target.value)}
                    className="w-full px-4 py-3 bg-gym-900 border border-gym-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gym-200 transition resize-none"
                    rows={3} placeholder="Describí tu comida..." />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======== TAB: MEASUREMENTS ======== */}
        {tab === 'measurements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">Registrá nuevas medidas corporales</p>
              <button onClick={() => navigate('/evolution')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gym-700 text-gray-300 rounded-xl font-bold text-sm hover:bg-gym-600 transition">
                <ExternalLink size={14} /> Ver evolución
              </button>
            </div>

            <form onSubmit={handleSaveMeas} className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'weight', label: 'Peso (kg)' },
                { key: 'chest', label: 'Pecho (cm)' },
                { key: 'waist', label: 'Cintura (cm)' },
                { key: 'arms', label: 'Brazos (cm)' },
                { key: 'legs', label: 'Piernas (cm)' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{f.label}</label>
                  <input type="number" step="0.1" value={measForm[f.key]}
                    onChange={e => setMeasForm({ ...measForm, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white focus:outline-none focus:border-gym-400" />
                </div>
              ))}
              <div className="col-span-2 md:col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
                <textarea value={measForm.notes} onChange={e => setMeasForm({ ...measForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white focus:outline-none focus:border-gym-400 resize-none" rows={2} />
              </div>
              <div className="col-span-2 md:col-span-3">
                <button type="submit" disabled={measSaving}
                  className={`px-6 py-2.5 rounded-lg font-bold transition shadow-lg ${
                    measSaved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 hover:from-emerald-400 hover:to-green-500'
                  }`}>
                  {measSaving ? 'Guardando...' : measSaved ? 'Guardado ✓' : 'Guardar Medición'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======== TAB: USERS ======== */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">{users.length} usuarios registrados</p>
              <button onClick={() => { resetUserForm(); setEditingUserId(null); setShowUserForm(true) }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl text-sm font-bold">
                <Plus size={14} /> Nuevo
              </button>
            </div>

            {showUserForm && (
              <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-5 mb-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  {editingUserId ? 'Editar usuario' : 'Nuevo usuario'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Documento *</label>
                    <input value={userForm.document_id} onChange={e => setUserForm(f => ({ ...f, document_id: e.target.value }))}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email</label>
                    <input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
                    <input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{editingUserId ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *'}</label>
                    <input type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveUser} className="px-4 py-2 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl text-sm font-bold">
                    <Save size={14} className="inline mr-1" /> {editingUserId ? 'Actualizar' : 'Crear'}
                  </button>
                  <button onClick={() => { setShowUserForm(false); setEditingUserId(null); resetUserForm() }}
                    className="px-4 py-2 bg-gym-700 text-gray-400 rounded-xl text-sm font-bold"><X size={14} className="inline mr-1" />Cancelar</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">{u.name}{u.role === 'admin' ? ' 👑' : ''}</p>
                    <p className="text-xs text-gray-500">
                      Doc: {u.document_id}{u.email ? ` · ${u.email}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button onClick={() => handleEditUser(u)} className="p-1.5 text-gray-400 hover:text-gym-300 transition"><Pencil size={14} /></button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="p-1.5 text-gray-400 hover:text-gym-400 transition"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======== TAB: CATALOG ======== */}
        {tab === 'catalog' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">Catálogo global de ejercicios ({globalExercises.length})</p>
              <button onClick={() => { setShowGlobalForm(true); setEditingGlobal(null); setGlobalForm({ name: '', muscle_group: '', description: '', gif_url: '' }) }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-xl font-bold text-sm transition shadow-lg hover:from-emerald-400 hover:to-green-500">
                <Plus size={14} /> Nuevo ejercicio
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={catalogSearch} onChange={e => { setCatalogSearch(e.target.value); loadGlobalCatalog(e.target.value, catalogGroup) }}
                  className="w-full pl-8 pr-3 py-2 bg-gym-800 border border-gym-700 rounded-xl text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Buscar en el catálogo..." />
              </div>
              <select value={catalogGroup} onChange={e => { setCatalogGroup(e.target.value); loadGlobalCatalog(catalogSearch, e.target.value) }}
                className="px-3 py-2 bg-gym-800 border border-gym-700 rounded-xl text-white text-sm focus:outline-none focus:border-gym-400">
                <option value="">Todos los grupos</option>
                {['Pecho','Espalda','Piernas','Hombros','Bíceps','Tríceps','Abdominales','Glúteos','Trapecio','Antebrazos','Cardio','Compuestos'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Global exercise form */}
            {showGlobalForm && (
              <div className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-5 mb-4">
                <h3 className="text-sm font-bold text-white mb-4">{editingGlobal ? 'Editar ejercicio global' : 'Nuevo ejercicio global'}</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nombre</label>
                    <input value={globalForm.name} onChange={e => setGlobalForm({ ...globalForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Grupo muscular</label>
                    <select value={globalForm.muscle_group} onChange={e => setGlobalForm({ ...globalForm, muscle_group: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400">
                      <option value="">Seleccionar...</option>
                      {['Pecho','Espalda','Piernas','Hombros','Bíceps','Tríceps','Abdominales','Glúteos','Trapecio','Antebrazos','Cardio','Compuestos'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">GIF URL (UUID)</label>
                    <input value={globalForm.gif_url} onChange={e => setGlobalForm({ ...globalForm, gif_url: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Descripción</label>
                    <textarea value={globalForm.description} onChange={e => setGlobalForm({ ...globalForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400 resize-none" rows={2} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={async () => {
                    try {
                      if (editingGlobal) {
                        await adminUpdateGlobalExercise(editingGlobal.id, globalForm)
                      } else {
                        await adminCreateGlobalExercise(globalForm)
                      }
                      setShowGlobalForm(false)
                      setEditingGlobal(null)
                      loadGlobalCatalog(catalogSearch, catalogGroup)
                    } catch {}
                  }} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-lg font-bold text-sm transition hover:from-emerald-400 hover:to-green-500">
                    <Save size={14} /> {editingGlobal ? 'Actualizar' : 'Crear'}
                  </button>
                  <button onClick={() => { setShowGlobalForm(false); setEditingGlobal(null) }}
                    className="px-4 py-2 bg-gym-700 text-gray-300 rounded-lg font-bold text-sm transition hover:bg-gym-600">Cancelar</button>
                </div>
              </div>
            )}

            {/* Global exercises list grouped */}
            <div className="space-y-3">
              {['Pecho','Espalda','Piernas','Hombros','Bíceps','Tríceps','Abdominales','Glúteos','Trapecio','Antebrazos','Cardio','Compuestos'].map(group => {
                const groupExercises = globalExercises.filter(e => e.muscle_group === group)
                if (groupExercises.length === 0) return null
                return (
                  <div key={group} className="bg-gym-800/30 border border-gym-700/30 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-gym-800/50 border-b border-gym-700/30">
                      <span className="text-sm font-bold text-gym-300">{group}</span>
                      <span className="text-xs text-gray-500 ml-2">({groupExercises.length})</span>
                    </div>
                    <div className="divide-y divide-gym-700/20">
                      {groupExercises.map(ex => (
                        <div key={ex.id} className="px-4 py-2 flex items-center justify-between hover:bg-gym-800/30 transition">
                          <span className="text-sm text-white">{ex.name}</span>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <button onClick={() => { setGlobalForm({ name: ex.name, muscle_group: ex.muscle_group, description: ex.description, gif_url: ex.gif_url }); setEditingGlobal(ex); setShowGlobalForm(true) }}
                              className="p-1 text-gray-400 hover:text-gym-300 transition" title="Editar"><Pencil size={12} /></button>
                            <button onClick={async () => {
                              if (!confirm(`¿Eliminar "${ex.name}" del catálogo?`)) return
                              try { await adminDeleteGlobalExercise(ex.id); loadGlobalCatalog(catalogSearch, catalogGroup) } catch {}
                            }} className="p-1 text-gray-400 hover:text-gym-400 transition" title="Eliminar"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {globalExercises.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron ejercicios en el catálogo</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
