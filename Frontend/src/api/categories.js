import client from './client'

export const getCategories = () => client.get('/categories').then((res) => res.data)

export const createCategory = (payload) => client.post('/categories', payload).then((res) => res.data)

export const updateCategory = (id, payload) => client.put(`/categories/${id}`, payload).then((res) => res.data)

export const deleteCategory = (id) => client.delete(`/categories/${id}`)
