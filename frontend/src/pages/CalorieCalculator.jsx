import React, { useState, useRef, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { analyzeFoodImage, searchFoods, calculateCalories } from '../api'
import { Camera, Upload, Loader2, Utensils, AlertCircle, Image as ImageIcon, Search, Plus, X, Check } from 'lucide-react'

const MEAL_TYPES = ['desayuno', 'almuerzo', 'cena', 'snack']

export default function CalorieCalculator() {
  const [tab, setTab] = useState('manual')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)

  const [search, setSearch] = useState('')
  const [foodResults, setFoodResults] = useState([])
  const [selectedFoods, setSelectedFoods] = useState([])
  const [searching, setSearching] = useState(false)
  const [mealType, setMealType] = useState('')
  const searchTimer = useRef(null)

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setFoodResults([]); return }
    setSearching(true)
    try {
      const data = await searchFoods(q)
      setFoodResults(data)
    } catch { setFoodResults([]) }
    setSearching(false)
  }, [])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => doSearch(search), 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search, doSearch])

  const addFood = (food) => {
    setSelectedFoods(prev => [...prev, { ...food, grams: 100, id: Date.now() + Math.random() }])
    setSearch('')
    setFoodResults([])
  }

  const removeFood = (id) => setSelectedFoods(prev => prev.filter(f => f.id !== id))

  const updateGrams = (id, grams) => {
    setSelectedFoods(prev => prev.map(f => f.id === id ? { ...f, grams: Math.max(1, parseInt(grams) || 0) } : f))
  }

  const calcItemCalories = (food) => Math.round((food.caloriesPer100g / 100) * food.grams)

  const totalManualCalories = selectedFoods.reduce((s, f) => s + calcItemCalories(f), 0)

  const handleManualCalculate = async () => {
    if (selectedFoods.length === 0) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await calculateCalories(selectedFoods.map(f => ({ name: f.name, grams: f.grams })))
      setResult({ ...data, mealType: mealType || 'desconocido' })
    } catch (err) {
      const items = selectedFoods.map(f => ({
        name: f.name,
        quantity: `${f.grams}g`,
        calories: calcItemCalories(f),
      }))
      setResult({ foods: items, totalCalories: totalManualCalories, mealType: mealType || 'desconocido', local: true })
    }
    setLoading(false)
  }

  const handleFile = (file) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
    setShowCamera(false)
  }

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(s)
      setShowCamera(true)
      setPreview(null)
      setImage(null)
      setResult(null)
      setError('')
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s }, 100)
    } catch { setError('No se pudo acceder a la cámara') }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !stream) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    canvas.toBlob((blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      setImage(file)
      setPreview(URL.createObjectURL(blob))
      setResult(null)
      setError('')
      stopCamera()
    }, 'image/jpeg')
  }

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null) }
    setShowCamera(false)
  }

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await analyzeFoodImage(image)
      if (data.error) {
        setError(data.message || data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al analizar la imagen')
    }
    setLoading(false)
  }

  const reset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError('')
    setSelectedFoods([])
    setSearch('')
    setFoodResults([])
    setMealType('')
    stopCamera()
  }

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Utensils size={24} className="text-gym-300" />
              Calculadora de Calorías
            </h1>
            <p className="text-gray-400 text-sm mt-1">Estimá las calorías de tus comidas</p>
          </div>
        </div>

        <div className="flex gap-1 bg-gym-800 rounded-xl p-1 mb-6">
          <button onClick={() => { setTab('manual'); setResult(null); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${tab === 'manual' ? 'bg-gym-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            <Search size={16} /> Manual
          </button>
          <button onClick={() => { setTab('photo'); setResult(null); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${tab === 'photo' ? 'bg-gym-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            <Camera size={16} /> Foto
          </button>
        </div>

        {tab === 'manual' && !result && (
          <div className="space-y-4">
            <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscá un alimento (ej: pollo, arroz, aguacate)..."
                  className="w-full bg-gym-700 border border-gym-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gym-400 text-sm"
                />
                {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gym-300 animate-spin" />}
              </div>

              {foodResults.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
                  {foodResults.map((food, i) => (
                    <button key={i} onClick={() => addFood(food)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-gym-700/50 hover:bg-gym-600 rounded-xl transition text-left group">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.defaultPortion} &middot; {food.caloriesPer100g} kcal/100g</p>
                      </div>
                      <Plus size={18} className="text-gym-400 group-hover:text-white shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedFoods.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 font-semibold">Alimentos agregados</p>
                {selectedFoods.map(food => {
                  const cal = calcItemCalories(food)
                  return (
                    <div key={food.id} className="bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{food.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" value={food.grams} min={1} max={5000}
                          onChange={e => updateGrams(food.id, e.target.value)}
                          className="w-16 bg-gym-700 border border-gym-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-gym-400" />
                        <span className="text-xs text-gray-500">g</span>
                      </div>
                      <div className="text-right shrink-0 w-16">
                        <p className="text-sm font-extrabold text-gym-300">{cal}</p>
                      </div>
                      <button onClick={() => removeFood(food.id)} className="text-gray-600 hover:text-red-400 transition">
                        <X size={16} />
                      </button>
                    </div>
                  )
                })}

                <div className="bg-gradient-to-r from-gym-400/20 to-orange-500/20 border border-gym-400/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-400 font-semibold">Tipo de comida</p>
                    <div className="flex gap-1">
                      {MEAL_TYPES.map(mt => (
                        <button key={mt} onClick={() => setMealType(mt === mealType ? '' : mt)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${mt === mealType ? 'bg-gym-400 text-white' : 'bg-gym-700 text-gray-400 hover:text-white'}`}>
                          {mt.charAt(0).toUpperCase() + mt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-extrabold text-white">{totalManualCalories} <span className="text-sm text-gray-500">kcal</span></p>
                  </div>
                </div>

                <button onClick={handleManualCalculate} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-xl font-bold transition shadow-lg hover:from-emerald-400 hover:to-green-500 disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Calcular total
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'photo' && !result && (
          <div>
            {!preview && !showCamera ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-12 text-center w-full">
                  <ImageIcon size={56} className="text-gym-700 mx-auto mb-4" />
                  <p className="text-gray-500 mb-6">Foto de tu comida para analizar con IA</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-6 py-3 bg-gym-700 hover:bg-gym-600 text-white rounded-xl font-bold transition">
                      <Upload size={18} /> Subir imagen
                    </button>
                    <button onClick={startCamera}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl font-bold transition shadow-lg">
                      <Camera size={18} /> Tomar foto
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                </div>
              </div>
            ) : showCamera ? (
              <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-video bg-black object-cover" />
                <div className="flex gap-3 p-4 justify-center">
                  <button onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl font-bold transition shadow-lg">
                    <Camera size={18} /> Capturar
                  </button>
                  <button onClick={stopCamera} className="px-6 py-3 bg-gym-700 text-gray-300 rounded-xl font-bold transition hover:bg-gym-600">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl overflow-hidden">
                  <img src={preview} alt="Comida" className="w-full aspect-video object-cover" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAnalyze} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-xl font-bold transition shadow-lg hover:from-emerald-400 hover:to-green-500">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Utensils size={18} />}
                    Analizar comida
                  </button>
                  <button onClick={reset} className="px-4 py-3 bg-gym-700 text-gray-300 rounded-xl font-bold transition hover:bg-gym-600">
                    Cambiar foto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && tab === 'photo' && (
          <div className="flex flex-col items-center py-10">
            <Loader2 size={40} className="text-gym-300 animate-spin mb-4" />
            <p className="text-gray-400">Analizando la imagen...</p>
          </div>
        )}

        {error && (
          <div className="bg-gym-900/50 border border-gym-400/30 rounded-xl p-4 flex items-start gap-3 mt-4">
            <AlertCircle size={18} className="text-gym-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">Error</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && result.foods && result.foods.length > 0 && (
          <div className="space-y-3 mt-4">
            {result.mealType && result.mealType !== 'desconocido' && (
              <div className="bg-gym-800/30 border border-gym-700/30 rounded-xl px-4 py-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo de comida</p>
                <p className="text-white font-bold capitalize">{result.mealType}</p>
              </div>
            )}

            <div className="bg-gradient-to-r from-gym-400 to-orange-500 rounded-2xl p-5 text-center shadow-xl">
              <p className="text-xs text-white/80 uppercase tracking-wider font-semibold">Calorías totales</p>
              <p className="text-4xl font-extrabold text-white mt-1">{result.totalCalories}</p>
              <p className="text-xs text-white/60 mt-1">kcal</p>
            </div>

            <div className="space-y-2">
              {result.foods.map((food, i) => (
                <div key={i} className={`bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 flex items-center justify-between ${result.local ? 'border-gym-400/30' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{food.name}</p>
                    <p className="text-xs text-gray-500">{food.quantity}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-extrabold text-gym-300">{food.calories}</p>
                    <p className="text-[10px] text-gray-500">kcal</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={reset}
              className="w-full py-3 bg-gym-700 hover:bg-gym-600 text-white rounded-xl font-bold transition">
              Calcular otra comida
            </button>
          </div>
        )}

        {result && result.foods && result.foods.length === 0 && !result.error && (
          <div className="text-center py-10">
            <AlertCircle size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No se pudieron identificar alimentos</p>
            <button onClick={reset} className="mt-4 px-6 py-2 bg-gym-700 hover:bg-gym-600 text-white rounded-xl font-bold transition">
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
