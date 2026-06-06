import React, { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import { analyzeFoodImage } from '../api'
import { Camera, Upload, Loader2, Utensils, AlertCircle, Image as ImageIcon } from 'lucide-react'

export default function CalorieCalculator() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)

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
    } catch {
      setError('No se pudo acceder a la cámara')
    }
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
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError('')
    stopCamera()
  }

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Utensils size={24} className="text-gym-300" />
              Calculadora de Calorías
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sacale una foto a tu comida y estimá sus calorías</p>
          </div>
        </div>

        {!preview && !showCamera ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl p-16 text-center w-full">
              <ImageIcon size={64} className="text-gym-700 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">Seleccioná una foto de tu comida para analizar</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 bg-gym-700 hover:bg-gym-600 text-white rounded-xl font-bold transition"
                >
                  <Upload size={18} />
                  Subir imagen
                </button>
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl font-bold transition shadow-lg"
                >
                  <Camera size={18} />
                  Tomar foto
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
          </div>
        ) : showCamera ? (
          <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video bg-black object-cover" />
            <div className="flex gap-3 p-4 justify-center">
              <button
                onClick={capturePhoto}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-400 to-orange-500 text-white rounded-xl font-bold transition shadow-lg"
              >
                <Camera size={18} />
                Capturar
              </button>
              <button
                onClick={stopCamera}
                className="px-6 py-3 bg-gym-700 text-gray-300 rounded-xl font-bold transition hover:bg-gym-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gym-800/50 border border-gym-700/50 rounded-2xl overflow-hidden">
              <img src={preview} alt="Comida" className="w-full aspect-video object-cover" />
            </div>

            {!result && !loading && (
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-200 to-emerald-400 text-gym-900 rounded-xl font-bold transition shadow-lg hover:from-emerald-400 hover:to-green-500"
                >
                  <Utensils size={18} />
                  Analizar comida
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-3 bg-gym-700 text-gray-300 rounded-xl font-bold transition hover:bg-gym-600"
                >
                  Cambiar foto
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center py-10">
                <Loader2 size={40} className="text-gym-300 animate-spin mb-4" />
                <p className="text-gray-400">Analizando la imagen...</p>
              </div>
            )}

            {error && (
              <div className="bg-gym-900/50 border border-gym-400/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-gym-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">Error</p>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {result && result.foods && result.foods.length > 0 && (
              <div className="space-y-3">
                {result.mealType && result.mealType !== 'desconocido' && (
                  <div className="bg-gym-800/30 border border-gym-700/30 rounded-xl px-4 py-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo de comida</p>
                    <p className="text-white font-bold capitalize">{result.mealType}</p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-gym-400 to-orange-500 rounded-2xl p-5 text-center shadow-xl">
                  <p className="text-xs text-white/80 uppercase tracking-wider font-semibold">Calorías totales estimadas</p>
                  <p className="text-4xl font-extrabold text-white mt-1">{result.totalCalories}</p>
                  <p className="text-xs text-white/60 mt-1">kcal</p>
                </div>

                <div className="space-y-2">
                  {result.foods.map((food, i) => (
                    <div key={i} className="bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 flex items-center justify-between">
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

                <button
                  onClick={reset}
                  className="w-full py-3 bg-gym-700 hover:bg-gym-600 text-white rounded-xl font-bold transition"
                >
                  Analizar otra comida
                </button>
              </div>
            )}

            {result && result.foods && result.foods.length === 0 && !result.error && (
              <div className="text-center py-10">
                <AlertCircle size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No se pudieron identificar alimentos en la imagen</p>
                <button onClick={reset} className="mt-4 px-6 py-2 bg-gym-700 hover:bg-gym-600 text-white rounded-xl font-bold transition">
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
