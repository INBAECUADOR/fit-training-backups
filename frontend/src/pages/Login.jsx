import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const [credential, setCredential] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isEmail = credential.includes('@')

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = isEmail ? { email: credential, password: pass } : { document_id: credential, password: pass }
      const data = await login(payload)
      localStorage.setItem('token', data.token)
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch {
      setError('Email/documento o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gym-900 via-gym-800 to-gym-700 p-4">
      <div className="bg-gym-800/80 backdrop-blur border border-gym-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src="https://enriquezmania.com/wp-content/uploads/2024/08/logo.png"
              alt="EnriquezMania"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">EnriquezMania</h1>
          <p className="text-gray-500 text-sm mt-1">Entrenamiento Personalizado</p>
          <p className="text-[10px] text-gym-400/60 mt-2 font-medium tracking-wide">
            Plataforma creada por el Ing. Jose Luis Enriquez
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email o Documento</label>
            <input
              type="text"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              className="w-full px-4 py-3 bg-gym-900 border border-gym-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gym-400 focus:ring-1 focus:ring-gym-400/30 transition-all"
              placeholder="Ingresá tu email o documento"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full px-4 py-3 bg-gym-900 border border-gym-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gym-400 focus:ring-1 focus:ring-gym-400/30 transition-all"
              placeholder="Ingresá tu contraseña"
              required
            />
          </div>
          {error && <p className="text-gym-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gym-400 to-orange-500 hover:brightness-110 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-gym-400/30"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
