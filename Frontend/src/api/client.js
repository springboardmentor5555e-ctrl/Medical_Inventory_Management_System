import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const client = axios.create({ baseURL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('medistock_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medistock_token')
      localStorage.removeItem('medistock_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Turns an axios error into a message safe to show the user — and critically,
 * tells the difference between "the server responded with an error" (e.g. wrong
 * password, validation failure) and "we couldn't reach the server at all" (backend
 * not running, wrong port, CORS block). Without this distinction, an unreachable
 * backend looks identical to a wrong password, which is misleading.
 */
export function getErrorMessage(err, fallback) {
  if (err.response) {
    return err.response.data?.message || fallback
  }
  if (err.request) {
    return `Can't reach the server at ${baseURL}. Is the backend running? (Check the terminal it's running in, and confirm it printed "Started MedistockApplication".)`
  }
  return err.message || fallback
}

export default client
