import client from './client'

export const getNotifications = (unreadOnly = false) =>
  client.get('/notifications', { params: { unreadOnly } }).then((res) => res.data)

export const getUnreadCount = () =>
  client.get('/notifications/unread-count').then((res) => res.data.count)

export const markNotificationRead = (id) =>
  client.patch(`/notifications/${id}/read`).then((res) => res.data)

export const markAllNotificationsRead = () => client.post('/notifications/mark-all-read')
