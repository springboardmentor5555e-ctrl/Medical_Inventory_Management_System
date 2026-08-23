import client from './client'

export const searchMedicines = (params = {}) =>
  client.get('/medicines', { params }).then((res) => res.data)

export const getMedicine = (id) => client.get(`/medicines/${id}`).then((res) => res.data)

export const createMedicine = (payload) => client.post('/medicines', payload).then((res) => res.data)

export const updateMedicine = (id, payload) => client.put(`/medicines/${id}`, payload).then((res) => res.data)

export const deleteMedicine = (id) => client.delete(`/medicines/${id}`)

export const adjustStock = (id, quantityChange, note) =>
  client.patch(`/medicines/${id}/stock`, { quantityChange, note }).then((res) => res.data)

export const getStockHistory = (id) => client.get(`/medicines/${id}/stock-history`).then((res) => res.data)

export const getLowStock = (threshold = 20) =>
  client.get('/medicines/alerts/low-stock', { params: { threshold } }).then((res) => res.data)

export const getExpiringSoon = (days = 30) =>
  client.get('/medicines/alerts/expiring-soon', { params: { days } }).then((res) => res.data)

export const getExpired = () => client.get('/medicines/alerts/expired').then((res) => res.data)

export const getRecentStockActivity = (limit = 15) =>
  client.get('/stock-logs/recent', { params: { limit } }).then((res) => res.data)
