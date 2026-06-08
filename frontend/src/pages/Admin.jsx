import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import {
  adminGetExercises, adminCreateExercise, adminUpdateExercise, adminDeleteExercise,
  adminGetRoutines, adminUpdateRoutine,
  adminGetGlobalExercises, adminCreateGlobalExercise, adminUpdateGlobalExercise, adminDeleteGlobalExercise,
  adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser,
  getDiet, saveDiet,
  getMeasurements, saveMeasurement, deleteMeasurement,
  aiGeneratePlan, aiApprovePlan,
} from '../api'
import { Plus, Pencil, Trash2, Save, X, Dumbbell, ChevronDown, ChevronUp, Utensils, TrendingUp, ExternalLink, Search, Globe, BookOpen, Users as UsersIcon, Camera, Bot, Loader2, AlertCircle, Check, User, Apple, RefreshCw } from 'lucide-react'
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

const AI_GOALS = ['bajar de peso', 'ganar masa muscular', 'tonificar', 'mantener peso', 'resistencia', 'fuerza']
const AI_EXPERIENCE = ['principiante', 'intermedio', 'avanzado']
const AI_GENDERS = ['masculino', 'femenino']
const AI_EQUIPMENT = ['gimnasio completo', 'gimnasio básico', 'casa con mancuernas', 'casa sin equipamiento']
const AI_MEAL_LABELS = { breakfast: 'Desayuno', morning_snack: 'Snack Mañana', lunch: 'Almuerzo', afternoon_snack: 'Snack Tarde', dinner: 'Cena' }

const MUSCLE_GROUPS = [
  { en: 'pectorals', es: 'Pecho' },
  { en: 'upper back', es: 'Espalda alta' },
  { en: 'lats', es: 'Dorsales' },
  { en: 'delts', es: 'Hombros' },
  { en: 'biceps', es: 'Bíceps' },
  { en: 'triceps', es: 'Tríceps' },
  { en: 'abs', es: 'Abdominales' },
  { en: 'glutes', es: 'Glúteos' },
  { en: 'quads', es: 'Cuádriceps' },
  { en: 'hamstrings', es: 'Isquiotibiales' },
  { en: 'calves', es: 'Gemelos' },
  { en: 'forearms', es: 'Antebrazos' },
  { en: 'traps', es: 'Trapecio' },
  { en: 'cardiovascular system', es: 'Cardio' },
  { en: 'abductors', es: 'Abductores' },
  { en: 'adductors', es: 'Aductores' },
  { en: 'levator scapulae', es: 'Elevador escápula' },
  { en: 'serratus anterior', es: 'Serrato' },
  { en: 'spine', es: 'Espina dorsal' },
]
const muscleLabel = (en) => MUSCLE_GROUPS.find(g => g.en === en)?.es || en

const exerciseImgSrc = (gifUrl) => {
  if (!gifUrl) return null
  return gifUrl.includes('://') ? gifUrl : `https://adminweb.blob.core.windows.net/gym1/${gifUrl}.gif`
}

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
  const [form, setForm] = useState({ name: '', series: '', reps: '', rest: '', observation: '', gif_url: '', global_exercise_id: null })
  const [expandedDays, setExpandedDays] = useState(DAYS.reduce((a, d) => ({ ...a, [d]: true }), {}))

  // --- Diet ---
  const [meals, setMeals] = useState({})
  const [dietDay, setDietDay] = useState('Lunes')
  const [dietSaving, setDietSaving] = useState(false)
  const [dietSaved, setDietSaved] = useState(false)

  // --- Measurements ---
  const [measurements, setMeasurements] = useState([])
  const [measForm, setMeasForm] = useState({ weight: '', height: '', neck: '', shoulders: '', chest: '', waist: '', arms: '', legs: '', back: '', biceps: '', forearms: '', wrist: '', mid_abdomen: '', hips: '', thigh: '', mid_thigh: '', calf: '', notes: '' })
  const [measPhotos, setMeasPhotos] = useState({ photo1: null, photo2: null, photo3: null, photo4: null })
  const [measPhotoPreviews, setMeasPhotoPreviews] = useState({ photo1: '', photo2: '', photo3: '', photo4: '' })
  const [measSaving, setMeasSaving] = useState(false)
  const [measSaved, setMeasSaved] = useState(false)

  // --- Global Catalog ---
  const [globalExercises, setGlobalExercises] = useState([])
  const [catalogSearch, setCatalogSearch] = useState('')
  const [catalogGroup, setCatalogGroup] = useState('')
  const [showGlobalForm, setShowGlobalForm] = useState(false)
  const [globalForm, setGlobalForm] = useState({ name: '', name_es: '', muscle_group: '', description: '', gif_url: '' })
  const [editingGlobal, setEditingGlobal] = useState(null)
  const [showGlobalPicker, setShowGlobalPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerGroup, setPickerGroup] = useState('')

  // --- Exercise form extended ---
  const [globalPickerExercises, setGlobalPickerExercises] = useState([])
  const [expandedGif, setExpandedGif] = useState(null)

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

  useEffect(() => {
    if (tab === 'catalog') loadGlobalCatalog('', '')
  }, [tab])

  // Root admin — no mostrar tabs de datos si el usuario es admin
  const selectedUser = users.find(u => u.id === selectedUserId)
  const isRootAdmin = selectedUser?.role === 'admin'

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

  const resetForm = () => setForm({ name: '', series: '', reps: '', rest: '', observation: '', gif_url: '', global_exercise_id: null })

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
    setForm(prev => ({ ...prev, name: ex.name_es || ex.name, gif_url: ex.gif_url || prev.gif_url, global_exercise_id: ex.id }))
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
    setForm({ name: ex.name, series: String(ex.series), reps: String(ex.reps), rest: ex.rest || '', observation: ex.observation || '', gif_url: ex.gif_url || '' })
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
      const fd = new FormData()
      const fields = ['weight','height','neck','shoulders','chest','waist','arms','legs','back','biceps','forearms','wrist','mid_abdomen','hips','thigh','mid_thigh','calf']
      fields.forEach(k => fd.append(k, parseFloat(measForm[k]) || 0))
      fd.append('notes', measForm.notes)
      if (measPhotos.photo1) fd.append('photo1', measPhotos.photo1)
      if (measPhotos.photo2) fd.append('photo2', measPhotos.photo2)
      if (measPhotos.photo3) fd.append('photo3', measPhotos.photo3)
      if (measPhotos.photo4) fd.append('photo4', measPhotos.photo4)
      await saveMeasurement(fd, userParams)
      getMeasurements(userParams).then(setMeasurements).catch(() => {})
      setMeasSaved(true)
      const empty = Object.fromEntries(fields.map(k => [k, '']))
      setMeasForm({ ...empty, notes: '' })
      setMeasPhotos({ photo1: null, photo2: null, photo3: null, photo4: null })
      setMeasPhotoPreviews({ photo1: '', photo2: '', photo3: '', photo4: '' })
      setTimeout(() => setMeasSaved(false), 2000)
    } catch {} finally {
      setMeasSaving(false)
    }
  }

  const handleMeasPhoto = (field, file) => {
    setMeasPhotos(p => ({ ...p, [field]: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setMeasPhotoPreviews(prev => ({ ...prev, [field]: e.target.result }))
      reader.readAsDataURL(file)
    } else {
      setMeasPhotoPreviews(prev => ({ ...prev, [field]: '' }))
    }
  }

  // --- User CRUD ---
  const [userForm, setUserForm] = useState({ document_id: '', email: '', name: '', password: '', membership_start_date: '', membership_end_date: '' })
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)

  const resetUserForm = () => setUserForm({ document_id: '', email: '', name: '', password: '', membership_start_date: '', membership_end_date: '' })

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
    setUserForm({ document_id: u.document_id, email: u.email || '', name: u.name, password: '', membership_start_date: u.membership_start_date || '', membership_end_date: u.membership_end_date || '' })
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

  // --- AI Agent ---
  const [aiForm, setAiForm] = useState({
    age: '', weight: '', height: '', gender: '', goal: '',
    experience: '', trainingDays: '5', mealsPerDay: '5',
    allergies: '', conditions: '', equipment: 'gimnasio completo', observations: '',
  })
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState('')
  const [aiExpandedDay, setAiExpandedDay] = useState(null)
  const [aiSuccess, setAiSuccess] = useState('')
  const [aiAssignUser, setAiAssignUser] = useState('')

  const aiUpdate = (key, val) => setAiForm(prev => ({ ...prev, [key]: val }))

  const handleAiGenerate = async () => {
    if (!aiForm.age || !aiForm.trainingDays || !aiForm.mealsPerDay) {
      setAiError('Completá al menos edad, días de entrenamiento y comidas al día')
      return
    }
    setAiGenerating(true)
    setAiError('')
    setAiResult(null)
    setAiSuccess('')
    try {
      const data = await aiGeneratePlan(aiForm)
      setAiResult(data)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.raw?.substring(0, 300) || 'Error al generar el plan'
      setAiError(msg)
    }
    setAiGenerating(false)
  }

  const handleAiApprove = async () => {
    if (!aiAssignUser) { setAiError('Seleccioná un usuario para asignar el plan'); return }
    setAiSaving(true)
    setAiError('')
    setAiSuccess('')
    try {
      await aiApprovePlan({
        userId: parseInt(aiAssignUser),
        routines: aiResult.routines,
        diet: aiResult.diet,
      })
      setAiSuccess(`Plan asignado correctamente a ${users.find(u => u.id === parseInt(aiAssignUser))?.name || ''}`)
    } catch (err) {
      setAiError(err.response?.data?.error || 'Error al asignar el plan')
    }
    setAiSaving(false)
  }

  const renderAiDietDay = (day) => {
    const meals = aiResult.diet[day]
    if (!meals) return <p className="text-gray-500 text-sm">Sin datos</p>
    return (
      <div className="space-y-2">
        {Object.entries(meals).map(([type, desc]) => (
          <div key={type} className="bg-gym-800/30 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{MEAL_LABELS[type] || type}</p>
            <p className="text-sm text-white">{desc}</p>
          </div>
        ))}
      </div>
    )
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
                {u.role === 'admin' ? 'Admin' : u.name} ({u.document_id}){u.role === 'admin' ? ' 👑' : ''}
              </option>
            ))}
            {users.length === 0 && <option value="">Cargando...</option>}
          </select>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-6">
          {users.find(u => u.id === selectedUserId)?.role === 'admin' ? 'Admin' : (users.find(u => u.id === selectedUserId)?.name || 'Administración')}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'exercises', label: 'Ejercicios', icon: Dumbbell, hideForAdmin: true },
            { key: 'diet', label: 'Dietas', icon: Utensils, hideForAdmin: true },
            { key: 'measurements', label: 'Medidas', icon: TrendingUp, hideForAdmin: true },
            { key: 'users', label: 'Usuarios', icon: UsersIcon },
            { key: 'catalog', label: 'Catálogo', icon: BookOpen },
            { key: 'ai', label: 'Agente IA', icon: Bot },
          ].filter(t => !(isRootAdmin && t.hideForAdmin)).map(t => (
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
                <div key={ex.id} className="bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-gym-800/70 transition">
                  {exerciseImgSrc(ex.gif_url) && (
                    <img src={exerciseImgSrc(ex.gif_url)}
                      alt={ex.name} className="w-32 h-32 rounded-lg object-cover bg-gym-900 shrink-0 cursor-pointer hover:opacity-80 transition"
                      onClick={() => setExpandedGif(exerciseImgSrc(ex.gif_url))}
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
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
                          {MUSCLE_GROUPS.map(g => (
                            <option key={g.en} value={g.en}>{g.es}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {globalPickerExercises.map(ex => (
                          <button key={ex.id} onClick={() => pickFromCatalog(ex)}
                            className="w-full text-left px-3 py-2 bg-gym-900/50 hover:bg-gym-700 rounded-lg transition flex items-center gap-3">
                            {exerciseImgSrc(ex.gif_url) && (
                              <img src={exerciseImgSrc(ex.gif_url)} alt={ex.name}
                                className="w-16 h-16 rounded-lg object-cover bg-gym-900 shrink-0"
                                onError={e => { e.target.style.display = 'none' }} />
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="text-sm text-white block truncate">{ex.name_es || ex.name}</span>
                              <span className="text-[10px] text-gray-500">{muscleLabel(ex.muscle_group)}</span>
                            </div>
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
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Descanso</label>
                    <input value={form.rest} onChange={e => setForm({ ...form, rest: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Ej: 90s, 60s" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Observación</label>
                    <input value={form.observation} onChange={e => setForm({ ...form, observation: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">GIF URL</label>
                    <div className="flex gap-2 items-start">
                      <input value={form.gif_url} onChange={e => setForm({ ...form, gif_url: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400"
                        placeholder="UUID o URL completa del GIF" />
                      {exerciseImgSrc(form.gif_url) && (
                        <img src={exerciseImgSrc(form.gif_url)}
                          alt="preview" className="w-32 h-32 rounded-lg object-cover bg-gym-900 shrink-0 cursor-pointer hover:opacity-80 transition"
                          onClick={() => setExpandedGif(exerciseImgSrc(form.gif_url))}
                          onError={e => { e.target.style.display = 'none' }} />
                      )}
                    </div>
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
              <div>
                <p className="text-gray-400 text-sm">Registrá y seguí las medidas corporales</p>
                {measurements.length > 1 && (
                  <p className="text-xs text-gym-300 mt-1">
                    Última: {measurements[0].date?.slice(0,10)} · Anterior: {measurements[1].date?.slice(0,10)} · Diferencia: {Math.abs(new Date(measurements[0].date) - new Date(measurements[1].date)) / (1000*60*60*24)} días
                  </p>
                )}
              </div>
              <button onClick={() => navigate('/evolution')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gym-700 text-gray-300 rounded-xl font-bold text-sm hover:bg-gym-600 transition">
                <ExternalLink size={14} /> Ver evolución
              </button>
            </div>

            {/* Comparison cards */}
            {measurements.length >= 2 && (() => {
              const prev = measurements[measurements.length - 1]
              const curr = measurements[0]
              const fields = [
                { key: 'shoulders', label: 'Hombros' },
                { key: 'chest', label: 'Pecho' },
                { key: 'back', label: 'Espalda' },
                { key: 'neck', label: 'Cuello' },
                { key: 'biceps', label: 'Bíceps' },
                { key: 'forearms', label: 'Antebrazos' },
                { key: 'wrist', label: 'Muñeca' },
                { key: 'mid_abdomen', label: 'Abdomen Medio' },
                { key: 'waist', label: 'Cintura' },
                { key: 'hips', label: 'Cadera' },
                { key: 'thigh', label: 'Pierna' },
                { key: 'mid_thigh', label: 'Media Pierna' },
                { key: 'calf', label: 'Pantorrilla' },
                { key: 'weight', label: 'Peso', unit: 'kg' },
                { key: 'height', label: 'Altura', unit: 'cm' },
              ]
              return (
                <div className="bg-gym-800/30 border border-gym-700/30 rounded-xl p-4 mb-6">
                  <h3 className="text-xs font-bold text-gym-300 uppercase tracking-wider mb-3">Comparación</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <div className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center">
                      <p className="text-[10px] text-gray-600">Fecha Anterior</p>
                      <p className="text-xs text-gray-400 font-bold">{prev.date?.slice(0,10)}</p>
                    </div>
                    <div className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center">
                      <p className="text-[10px] text-gray-600">Fecha Actual</p>
                      <p className="text-xs text-gym-300 font-bold">{curr.date?.slice(0,10)}</p>
                    </div>
                    <div className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center">
                      <p className="text-[10px] text-gray-600">Días</p>
                      <p className="text-xs text-white font-bold">{Math.round(Math.abs(new Date(curr.date) - new Date(prev.date)) / (1000*60*60*24))}</p>
                    </div>
                    {fields.map(f => {
                      const pv = parseFloat(prev[f.key]) || 0
                      const cv = parseFloat(curr[f.key]) || 0
                      const diff = (cv - pv).toFixed(1)
                      const isGood = f.key === 'waist' || f.key === 'mid_abdomen' ? diff <= 0 : diff >= 0
                      return (
                        <div key={f.key} className="bg-gym-800/50 rounded-lg px-2 py-1.5 text-center border border-gym-700/20">
                          <p className="text-[10px] text-gray-500">{f.label}</p>
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <span className="text-gray-500">{pv.toFixed(1)}</span>
                            <span className="text-gym-300 font-bold">→ {cv.toFixed(1)}</span>
                            <span className={`font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                              {diff > 0 ? '+' : ''}{diff}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            <form onSubmit={handleSaveMeas} className="bg-gym-800/50 border border-gym-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-bold text-white mb-4">Nueva Medición</h3>

              {/* General */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Generales</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ key: 'weight', label: 'Peso (kg)', step: '0.1' },
                    { key: 'height', label: 'Altura (cm)', step: '1' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step={f.step} value={measForm[f.key]}
                        onChange={e => setMeasForm({ ...measForm, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Torso Superior */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Torso Superior</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ key: 'shoulders', label: 'Hombros (cm)' },
                    { key: 'chest', label: 'Pecho (cm)' },
                    { key: 'back', label: 'Espalda (cm)' },
                    { key: 'neck', label: 'Cuello (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={measForm[f.key]}
                        onChange={e => setMeasForm({ ...measForm, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Brazos */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Brazos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[{ key: 'biceps', label: 'Bíceps (cm)' },
                    { key: 'forearms', label: 'Antebrazos (cm)' },
                    { key: 'wrist', label: 'Muñeca (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={measForm[f.key]}
                        onChange={e => setMeasForm({ ...measForm, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Torso Inferior */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Torso Inferior</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[{ key: 'mid_abdomen', label: 'Abdomen Medio (cm)' },
                    { key: 'waist', label: 'Cintura (cm)' },
                    { key: 'hips', label: 'Cadera (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={measForm[f.key]}
                        onChange={e => setMeasForm({ ...measForm, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Piernas */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Piernas</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[{ key: 'thigh', label: 'Pierna (cm)' },
                    { key: 'mid_thigh', label: 'Media Pierna (cm)' },
                    { key: 'calf', label: 'Pantorrilla (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                      <input type="number" step="0.1" value={measForm[f.key]}
                        onChange={e => setMeasForm({ ...measForm, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gym-300 uppercase tracking-wider mb-2">Fotos de Progreso</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'photo1', label: 'Foto Frontal' },
                    { key: 'photo2', label: 'Foto Espalda' },
                    { key: 'photo3', label: 'Foto Lateral' },
                    { key: 'photo4', label: 'Foto Pose' },
                  ].map(p => (
                    <div key={p.key}>
                      <label className="block text-xs text-gray-400 mb-1">{p.label}</label>
                      <div className="flex flex-col items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-2 bg-gym-700 hover:bg-gym-600 text-gym-300 rounded-lg text-xs font-bold cursor-pointer transition w-full justify-center">
                          <Camera size={14} />
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => handleMeasPhoto(p.key, e.target.files[0])} />
                        </label>
                        {measPhotoPreviews[p.key] && (
                          <img src={measPhotoPreviews[p.key]} alt={p.label}
                            className="w-full aspect-[3/4] rounded-lg object-cover bg-gym-900" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-400 mb-1">Notas</label>
                <textarea value={measForm.notes} onChange={e => setMeasForm({ ...measForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400 resize-none" rows={2} />
              </div>

              <button type="submit" disabled={measSaving}
                className={`px-6 py-2.5 rounded-lg font-bold transition shadow-lg ${
                  measSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 hover:from-emerald-400 hover:to-green-500'
                }`}>
                {measSaving ? 'Guardando...' : measSaved ? 'Guardado ✓' : 'Guardar Medición'}
              </button>
            </form>

            {/* Measurements history */}
            {measurements.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Historial ({measurements.length})</h3>
                <div className="space-y-2">
                  {measurements.map(m => (
                    <div key={m.id} className="bg-gym-800/30 border border-gym-700/30 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 mb-1">{m.date?.slice(0,10)}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
                            <span>Peso: <strong>{m.weight} kg</strong></span>
                            <span>Hombros: <strong>{m.shoulders}</strong></span>
                            <span>Pecho: <strong>{m.chest}</strong></span>
                            <span>Espalda: <strong>{m.back}</strong></span>
                            <span>Bíceps: <strong>{m.biceps}</strong></span>
                            <span>Abdomen: <strong>{m.mid_abdomen}</strong></span>
                            <span>Cintura: <strong>{m.waist}</strong></span>
                            <span>Cadera: <strong>{m.hips}</strong></span>
                            <span>Pierna: <strong>{m.thigh}</strong></span>
                            <span>Pantorrilla: <strong>{m.calf}</strong></span>
                          </div>
                          {m.notes && <p className="text-xs text-gray-500 mt-1">{m.notes}</p>}
                          {[m.photo1, m.photo2, m.photo3, m.photo4].filter(Boolean).length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {[m.photo1, m.photo2, m.photo3, m.photo4].map((p, i) => p && (
                                <img key={i} src={p} alt={`Foto ${i+1}`}
                                  className="w-16 h-20 rounded-lg object-cover bg-gym-900 cursor-pointer hover:opacity-80 transition"
                                  onClick={() => setExpandedGif(p)} />
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={async () => {
                          if (!confirm('¿Eliminar esta medición?')) return
                          try { await deleteMeasurement(m.id); setMeasurements(prev => prev.filter(x => x.id !== m.id)) } catch {}
                        }} className="p-1.5 text-gray-400 hover:text-gym-400 transition shrink-0" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Inicio de membresía</label>
                    <input type="date" value={userForm.membership_start_date} onChange={e => setUserForm(f => ({ ...f, membership_start_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fin de membresía</label>
                    <input type="date" value={userForm.membership_end_date} onChange={e => setUserForm(f => ({ ...f, membership_end_date: e.target.value }))}
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
                    {u.membership_end_date && (
                      <p className={`text-xs mt-0.5 ${new Date(u.membership_end_date) < new Date() ? 'text-gym-400 font-bold' : 'text-emerald-400'}`}>
                        {u.membership_start_date ? `📅 ${new Date(u.membership_start_date).toLocaleDateString('es-MX')} → ` : ''}
                        {new Date(u.membership_end_date) < new Date() ? '🚫 Vencido: ' : '✅ Hasta: '}{new Date(u.membership_end_date).toLocaleDateString('es-MX')}
                      </p>
                    )}
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

        {/* ======== TAB: AI AGENT ======== */}
        {tab === 'ai' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-5">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User size={18} className="text-gym-300" /> Datos del cliente
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Edad *</label>
                      <input type="number" value={aiForm.age} onChange={e => aiUpdate('age', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Peso (kg)</label>
                      <input type="number" value={aiForm.weight} onChange={e => aiUpdate('weight', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Altura (cm)</label>
                      <input type="number" value={aiForm.height} onChange={e => aiUpdate('height', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Género</label>
                      <select value={aiForm.gender} onChange={e => aiUpdate('gender', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                        <option value="">Seleccionar</option>
                        {AI_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Objetivo</label>
                      <select value={aiForm.goal} onChange={e => aiUpdate('goal', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                        <option value="">Seleccionar</option>
                        {AI_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Experiencia</label>
                      <select value={aiForm.experience} onChange={e => aiUpdate('experience', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                        <option value="">Seleccionar</option>
                        {AI_EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Días x semana *</label>
                      <input type="number" min={1} max={7} value={aiForm.trainingDays} onChange={e => aiUpdate('trainingDays', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Comidas x día *</label>
                      <input type="number" min={2} max={6} value={aiForm.mealsPerDay} onChange={e => aiUpdate('mealsPerDay', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Equipo disponible</label>
                      <select value={aiForm.equipment} onChange={e => aiUpdate('equipment', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400">
                        {AI_EQUIPMENT.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Alergias / intolerancias</label>
                      <input value={aiForm.allergies} onChange={e => aiUpdate('allergies', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Ej: lactosa, gluten, frutos secos..." />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Condiciones / lesiones</label>
                      <input value={aiForm.conditions} onChange={e => aiUpdate('conditions', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Ej: dolor lumbar, hombro lesionado..." />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Observaciones específicas para el coach</label>
                      <textarea value={aiForm.observations} onChange={e => aiUpdate('observations', e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gym-400 resize-none" rows={3}
                        placeholder="Ej: necesita ejercicios de rehabilitación, prefiere rutinas cortas de 45min, tiene horarios específicos..." />
                    </div>
                  </div>
                  <button onClick={handleAiGenerate} disabled={aiGenerating}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl font-bold transition hover:opacity-90 disabled:opacity-50">
                    {aiGenerating ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
                    {aiGenerating ? 'Generando...' : 'Generar plan con IA'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {aiError && (
                  <div className="bg-gym-900/50 border border-gym-400/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-gym-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold text-sm">Error</p>
                      <p className="text-gray-400 text-sm">{aiError}</p>
                    </div>
                  </div>
                )}

                {aiSuccess && (
                  <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                    <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-emerald-300 text-sm">{aiSuccess}</p>
                  </div>
                )}

                {!aiResult && !aiGenerating && !aiError && (
                  <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-10 text-center">
                    <Bot size={48} className="text-gym-700 mx-auto mb-4" />
                    <p className="text-gray-500">Completá los datos del cliente y generá el plan</p>
                  </div>
                )}

                {aiGenerating && (
                  <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-10 text-center">
                    <Loader2 size={40} className="text-gym-300 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">El agente IA está generando el plan personalizado...</p>
                    <p className="text-gray-600 text-xs mt-2">Esto puede tomar hasta 30 segundos</p>
                  </div>
                )}

                {aiResult && !aiGenerating && (
                  <div className="space-y-4">
                    <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Dumbbell size={18} className="text-gym-300" /> Rutina
                        </h2>
                        {aiResult.dailyCalories && (
                          <span className="text-sm text-gym-300 font-bold">~{aiResult.dailyCalories} kcal/día</span>
                        )}
                      </div>
                      {aiResult.notes && (
                        <p className="text-xs text-gray-500 mb-3 italic">{aiResult.notes}</p>
                      )}
                      <div className="space-y-2">
                        {Object.entries(aiResult.routines).map(([day, dayData]) => (
                          <div key={day} className="bg-gym-800/50 rounded-xl overflow-hidden">
                            <button onClick={() => setAiExpandedDay(aiExpandedDay === day ? null : day)}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gym-700/50 transition">
                              <div className="text-left">
                                <p className="text-sm font-bold text-white">{day}</p>
                                <p className="text-xs text-gray-500">{dayData.day_label}</p>
                              </div>
                              {aiExpandedDay === day ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                            </button>
                            {aiExpandedDay === day && (
                              <div className="px-4 pb-3 space-y-1.5">
                                {dayData.exercises?.map((ex, i) => (
                                  <div key={i} className="bg-gym-700/30 rounded-lg px-3 py-2 flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-white">{ex.name}</p>
                                      {ex.observation && <p className="text-xs text-gray-500">{ex.observation}</p>}
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                      <p className="text-sm font-bold text-gym-300">{ex.series}×{ex.reps}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                        <Apple size={18} className="text-gym-300" /> Dieta
                      </h2>
                      <div className="space-y-2">
                        {Object.entries(aiResult.diet).map(([day, meals]) => (
                          <div key={day} className="bg-gym-800/50 rounded-xl overflow-hidden">
                            <button onClick={() => setAiExpandedDay(aiExpandedDay === `diet-${day}` ? null : `diet-${day}`)}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gym-700/50 transition">
                              <p className="text-sm font-bold text-white">{day}</p>
                              {aiExpandedDay === `diet-${day}` ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                            </button>
                            {aiExpandedDay === `diet-${day}` && (
                              <div className="px-4 pb-3">
                                {renderAiDietDay(day)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-4">
                      <label className="text-xs text-gray-500 block mb-2">Asignar plan a usuario</label>
                      <select value={aiAssignUser} onChange={e => setAiAssignUser(e.target.value)}
                        className="w-full bg-gym-700 border border-gym-600 rounded-xl px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-gym-400">
                        <option value="">Seleccionar usuario</option>
                        {users.filter(u => u.role !== 'admin').map(u => <option key={u.id} value={u.id}>{u.name} ({u.document_id})</option>)}
                      </select>
                      <button onClick={handleAiApprove} disabled={aiSaving || !aiAssignUser}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-xl font-bold transition hover:opacity-90 disabled:opacity-50">
                        {aiSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        {aiSaving ? 'Asignando...' : 'Asignar plan al usuario'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======== TAB: CATALOG ======== */}
        {tab === 'catalog' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">Catálogo global de ejercicios ({globalExercises.length})</p>
              <button onClick={() => { setShowGlobalForm(true); setEditingGlobal(null); setGlobalForm({ name: '', name_es: '', muscle_group: '', description: '', gif_url: '' }) }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-xl font-bold text-sm transition shadow-lg hover:from-emerald-400 hover:to-green-500">
                <Plus size={14} /> Nuevo ejercicio
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={catalogSearch} onChange={e => { setCatalogSearch(e.target.value); loadGlobalCatalog(e.target.value, catalogGroup) }}
                  className="w-full pl-8 pr-3 py-2 bg-gym-800 border border-gym-700 rounded-xl text-white text-sm focus:outline-none focus:border-gym-400" placeholder="Buscar ejercicio..." />
              </div>
              <select value={catalogGroup} onChange={e => { setCatalogGroup(e.target.value); loadGlobalCatalog(catalogSearch, e.target.value) }}
                className="px-3 py-2 bg-gym-800 border border-gym-700 rounded-xl text-white text-sm focus:outline-none focus:border-gym-400">
                <option value="">Todos los grupos</option>
                {MUSCLE_GROUPS.map(g => (
                  <option key={g.en} value={g.en}>{g.es}</option>
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
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nombre (español)</label>
                    <input value={globalForm.name_es} onChange={e => setGlobalForm({ ...globalForm, name_es: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Grupo muscular</label>
                    <select value={globalForm.muscle_group} onChange={e => setGlobalForm({ ...globalForm, muscle_group: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400">
                      <option value="">Seleccionar...</option>
                      {MUSCLE_GROUPS.map(g => (
                        <option key={g.en} value={g.en}>{g.es}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">GIF URL</label>
                    <input value={globalForm.gif_url} onChange={e => setGlobalForm({ ...globalForm, gif_url: e.target.value })}
                      className="w-full px-3 py-2 bg-gym-900 border border-gym-700 rounded-lg text-white text-sm focus:outline-none focus:border-gym-400" placeholder="UUID o URL completa del GIF" />
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
              {MUSCLE_GROUPS.map(g => {
                const groupExercises = globalExercises.filter(e => e.muscle_group === g.en)
                if (groupExercises.length === 0) return null
                return (
                  <div key={g.en} className="bg-gym-800/30 border border-gym-700/30 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-gym-800/50 border-b border-gym-700/30">
                      <span className="text-sm font-bold text-gym-300">{g.es}</span>
                      <span className="text-xs text-gray-500 ml-2">({groupExercises.length})</span>
                    </div>
                    <div className="divide-y divide-gym-700/20">
                      {groupExercises.map(ex => (
                        <div key={ex.id} className="px-4 py-2 flex items-center justify-between hover:bg-gym-800/30 transition">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {exerciseImgSrc(ex.gif_url) && (
                              <img src={exerciseImgSrc(ex.gif_url)} alt={ex.name}
                                className="w-24 h-24 rounded-lg object-cover bg-gym-900 shrink-0 cursor-pointer hover:opacity-80 transition"
                                onClick={() => setExpandedGif(exerciseImgSrc(ex.gif_url))}
                                onError={e => { e.target.style.display = 'none' }} />
                            )}
                            <span className="text-sm text-white truncate">{ex.name_es || ex.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <button onClick={() => { setGlobalForm({ name: ex.name, name_es: ex.name_es || '', muscle_group: ex.muscle_group, description: ex.description, gif_url: ex.gif_url }); setEditingGlobal(ex); setShowGlobalForm(true) }}
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

        {/* GIF expand modal */}
        {expandedGif && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setExpandedGif(null)}>
            <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <button onClick={() => setExpandedGif(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition text-lg font-bold">Cerrar ✕</button>
              <img src={expandedGif} alt="Ejercicio" className="w-full rounded-xl shadow-2xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
