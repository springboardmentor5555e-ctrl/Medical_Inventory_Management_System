import client from './client'

export const getSuppliers = (search) =>
  client.get('/suppliers', { params: search ? { search } : {} }).then((res) => res.data)

export const getSupplier = (id) => client.get(`/suppliers/${id}`).then((res) => res.data)

export const createSupplier = (payload) => client.post('/suppliers', payload).then((res) => res.data)

export const updateSupplier = (id, payload) => client.put(`/suppliers/${id}`, payload).then((res) => res.data)

export const deleteSupplier = (id) => client.delete(`/suppliers/${id}`)
