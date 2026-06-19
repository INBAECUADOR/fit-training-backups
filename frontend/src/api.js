import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.token}`
          processQueue(null, data.token)
          return api(original)
        } catch {
          processQueue(err, null)
        }
      }
      isRefreshing = false
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (data) =>
  api.post('/auth/login', data).then(r => r.data)

export const getRoutines = () =>
  api.get('/routines').then(r => r.data)

export const getExercises = (dayName) =>
  api.get(`/routines/${dayName}`).then(r => r.data)

export const saveResult = (data) =>
  api.post('/routines/result', data).then(r => r.data)

export const getResults = (exerciseId) =>
  api.get(`/routines/results/${exerciseId}`).then(r => r.data)

export const getMeasurements = (params) =>
  api.get('/measurements', { params }).then(r => r.data)

export const saveMeasurement = (data, params) => {
  if (data instanceof FormData) {
    return api.post('/measurements', data, { params, headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  }
  return api.post('/measurements', data, { params }).then(r => r.data)
}

export const deleteMeasurement = (id) =>
  api.delete(`/measurements/${id}`).then(r => r.data)

export const updateMeasurement = (id, data, params) => {
  if (data instanceof FormData) {
    return api.put(`/measurements/${id}`, data, { params, headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  }
  return api.put(`/measurements/${id}`, data, { params }).then(r => r.data)
}

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

export const getAlternatives = (exerciseId) =>
  api.get(`/routines/alternatives/${exerciseId}`).then(r => r.data)

export const getBodyComposition = () =>
  api.get('/measurements/composition').then(r => r.data)

export const getMeasurementsHistory = () =>
  api.get('/measurements/history').then(r => r.data)

export const getDiet = (params) =>
  api.get('/diet', { params }).then(r => r.data)

export const saveDiet = (meals, params) =>
  api.put('/diet', meals, { params }).then(r => r.data)

export const searchFoods = (q) =>
  api.get(`/calories/foods/search?q=${encodeURIComponent(q)}`).then(r => r.data)

export const getFoodCategories = () =>
  api.get('/calories/foods/categories').then(r => r.data)

export const calculateCalories = (items) =>
  api.post('/calories/manual', { items }).then(r => r.data)

export const analyzeFoodImage = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/calories/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  }).then(r => r.data)
}

export const adminGetExercises = (params) =>
  api.get('/admin/exercises', { params }).then(r => r.data)

export const adminCreateExercise = (data) =>
  api.post('/admin/exercises', data).then(r => r.data)

export const adminUpdateExercise = (id, data) =>
  api.put(`/admin/exercises/${id}`, data).then(r => r.data)

export const adminDeleteExercise = (id) =>
  api.delete(`/admin/exercises/${id}`).then(r => r.data)

export const adminGetRoutines = (params) =>
  api.get('/admin/routines', { params }).then(r => r.data)

export const adminUpdateRoutine = (id, data) =>
  api.put(`/admin/routines/${id}`, data).then(r => r.data)

export const adminGetUsers = () =>
  api.get('/admin/users').then(r => r.data)

export const adminCreateUser = (data) =>
  api.post('/admin/users', data).then(r => r.data)

export const adminUpdateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data).then(r => r.data)

export const adminDeleteUser = (id) =>
  api.delete(`/admin/users/${id}`).then(r => r.data)

export const adminGetGlobalExercises = (params) =>
  api.get('/admin/global-exercises', { params }).then(r => r.data)

export const adminCreateGlobalExercise = (data) =>
  api.post('/admin/global-exercises', data).then(r => r.data)

export const adminUpdateGlobalExercise = (id, data) =>
  api.put(`/admin/global-exercises/${id}`, data).then(r => r.data)

export const adminDeleteGlobalExercise = (id) =>
  api.delete(`/admin/global-exercises/${id}`).then(r => r.data)

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

// --- AI Agent ---

export const aiGeneratePlan = (data) =>
  api.post('/ai/generate', data, { timeout: 120000 }).then(r => r.data)

export const aiApprovePlan = (data) =>
  api.post('/ai/approve', data).then(r => r.data)

export const adminGetMotivation = () =>
  api.get('/admin/motivation').then(r => r.data)

export const adminGetApiKey = () =>
  api.get('/admin/api-key').then(r => r.data)

export const adminSetApiKey = (key) =>
  api.put('/admin/api-key', { key }).then(r => r.data)

export const adminCreateMotivation = (data) =>
  api.post('/admin/motivation', data).then(r => r.data)

export const adminDeleteMotivation = (id) =>
  api.delete(`/admin/motivation/${id}`).then(r => r.data)

export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return api.post('/avatar/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const changePassword = (data) =>
  api.put('/auth/password', data).then(r => r.data)

export default api
