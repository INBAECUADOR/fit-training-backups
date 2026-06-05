import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (document_id, password) =>
  api.post('/auth/login', { document_id, password }).then(r => r.data)

export const getRoutines = () =>
  api.get('/routines').then(r => r.data)

export const getExercises = (dayName) =>
  api.get(`/routines/${dayName}`).then(r => r.data)

export const saveResult = (data) =>
  api.post('/routines/result', data).then(r => r.data)

export const getResults = (exerciseId) =>
  api.get(`/routines/results/${exerciseId}`).then(r => r.data)

export const getMeasurements = () =>
  api.get('/measurements').then(r => r.data)

export const saveMeasurement = (data) =>
  api.post('/measurements', data).then(r => r.data)

export const getWeightHistory = () =>
  api.get('/measurements/weight').then(r => r.data)

export const saveWeight = (weight) =>
  api.post('/measurements/weight', { weight }).then(r => r.data)

export const getDashboard = () =>
  api.get('/dashboard').then(r => r.data)

export const getPRs = () =>
  api.get('/prs').then(r => r.data)

export const getSuggestion = (exerciseId) =>
  api.get(`/routines/suggest/${exerciseId}`).then(r => r.data)

export const downloadExport = (type) => {
  const token = localStorage.getItem('token')
  const url = `/api/export/${type}`
  return api.get(url, { responseType: 'blob' }).then(r => {
    const blob = new Blob([r.data], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = type === 'results' ? 'resultados.csv' : 'mediciones.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  })
}

export default api
