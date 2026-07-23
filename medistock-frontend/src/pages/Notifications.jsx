import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { Bell, AlertTriangle, Calendar, RefreshCw, CheckCircle, Check, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const Notifications = () => {
  const queryClient = useQueryClient();
  const [filterUnread, setFilterUnread] = useState(false);

  // 1. Fetch Notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', filterUnread],
    queryFn: () => {
      const url = filterUnread ? '/api/notifications/unread' : '/api/notifications';
      return axiosInstance.get(url).then(res => res.data);
    }
  });

  // 2. Mark as Read Mutation
  const readMutation = useMutation({
    mutationFn: (id) => axiosInstance.put(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Alert marked as read.');
    }
  });

  // 3. Mark All as Read Mutation
  const readAllMutation = useMutation({
    mutationFn: () => axiosInstance.put('/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All alerts dismissed.');
    }
  });

  const handleMarkAsRead = (id) => {
    readMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    readAllMutation.mutate();
  };

  // Icon selector based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle size={18} className="text-red-500 shrink-0" />;
      case 'EXPIRY':
        return <ShieldAlert size={18} className="text-amber-500 shrink-0" />;
      case 'REORDER':
        return <RefreshCw size={18} className="text-sky-500 shrink-0 animate-spin-slow" />;
      default:
        return <Bell size={18} className="text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            System Alerts & WhatsApp Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review low stock warnings, batch expirations, and procurement reports.
          </p>
        </div>

        {/* Global dismiss action */}
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={readAllMutation.isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-colors"
          >
            <CheckCircle size={16} />
            <span>Dismiss All Alerts</span>
          </button>
        )}
      </div>

      {/* Filter and query selection buttons */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 text-sm">
        <button
          onClick={() => setFilterUnread(false)}
          className={`pb-3 font-semibold relative transition-all ${
            !filterUnread 
              ? 'text-sky-600 dark:text-sky-400' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          All Activity Log
          {!filterUnread && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`pb-3 font-semibold relative transition-all ${
            filterUnread 
              ? 'text-sky-600 dark:text-sky-400' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Unread Alerts Only
          {filterUnread && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Notification items list */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.isRead 
                  ? 'bg-white/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 text-slate-500' 
                  : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex gap-3">
                {getNotificationIcon(notif.type)}
                <div>
                  <p className="text-sm font-medium leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                    <span>{notif.type.replace('_', ' ')} Alert</span>
                    <span>•</span>
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-500">WhatsApp Alert Dispatched</span>
                  </div>
                </div>
              </div>

              {/* Action: Mark individual read */}
              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
                  title="Mark as Read"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-450 text-sm">No notification alerts logged.</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
