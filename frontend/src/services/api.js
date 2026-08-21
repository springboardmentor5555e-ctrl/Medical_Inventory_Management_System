const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8080`

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function friendlyError(error) {
  if (error.status === 0) return 'Network error. Please verify the backend server is running on port 8080.'
  if (error.status === 401) return 'Session expired or unauthorized. Please sign in again.'
  if (error.status === 403) return 'Access denied. Your account role lacks permission for this action.'
  if (error.status === 404) return error.message || 'Requested medical record was not found.'
  if (error.status >= 500) return error.message || 'Internal server error. Please retry shortly.'
  return error.message || 'Request failed. Please review the inputs and retry.'
}

export async function apiRequest(path, { token, method = 'GET', body, headers = {} } = {}) {
  let response
  try {
    const isFormData = body instanceof FormData
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const networkError = new Error('Network connection failed. Ensure the MediStock backend is running.')
    networkError.status = 0
    throw networkError
  }

  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  const data = text && contentType.includes('application/json') ? JSON.parse(text) : text

  if (!response.ok) {
    let message = data?.message || 'Request failed'
    if (data?.validationErrors) {
      const details = Object.entries(data.validationErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ')
      message = details || message
    }
    const error = new Error(message)
    error.status = response.status
    error.details = data
    throw error
  }

  return data
}

export async function downloadReportFile(path, fileName, mimeType, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!response.ok) {
    const err = new Error(`Failed to download ${fileName}`)
    err.status = response.status
    throw err
  }
  const blob = await response.blob()
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  return true
}

