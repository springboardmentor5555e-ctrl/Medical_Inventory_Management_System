import React, { useEffect, useRef, useState } from 'react'
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../api/notifications'
import Badge from './Badge'

function toneFor(type) {
  if (type === 'OUT_OF_STOCK' || type === 'EXPIRED') return 'danger'
  return 'warning'
}

function labelFor(type) {
  return {
    LOW_STOCK: 'Low stock',
    OUT_OF_STOCK: 'Out of stock',
    EXPIRING_SOON: 'Expiring soon',
    EXPIRED: 'Expired',
  }[type] || type
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  const refreshCount = () => {
    getUnreadCount().then(setUnreadCount).catch(() => {})
  }

  useEffect(() => {
    refreshCount()
    const interval = setInterval(refreshCount, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOpen = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      getNotifications(false).then(setNotifications).finally(() => setLoading(false))
    }
  }

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    refreshCount()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button onClick={toggleOpen} className="relative p-2 rounded-md hover:bg-slate-100 transition">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 text-slate-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-brand-600 font-medium hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 px-4 py-6 text-center">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-slate-400 px-4 py-6 text-center">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <li key={n.id} className={`px-4 py-3 text-sm ${n.read ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Badge tone={toneFor(n.type)}>{labelFor(n.type)}</Badge>
                      <p className="text-slate-700 mt-1.5">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-xs text-brand-600 font-medium hover:underline whitespace-nowrap">
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
