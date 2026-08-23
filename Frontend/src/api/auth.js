import client from './client'

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((res) => res.data)

export const register = (fullName, email, password, role) =>
  client.post('/auth/register', { fullName, email, password, role }).then((res) => res.data)
