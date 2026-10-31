import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const NotificationsView: React.FC<{ onNavigateToComplaint: (id: string) => void }> = ({
  onNavigateToComplaint,
}) => {
  const { token, setUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setNotifications(data);
        const unread = data.filter((n) => n.is_read === 0).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [token]);

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch {
      // ignore
    }
  };

  const markSingleRead = async (id: string, link?: string | null) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link && link.startsWith('/complaints/')) {
        const compId = link.replace('/complaints/', '');
        onNavigateToComplaint(compId);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-400" />
            Notifications & Status Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications for status transitions, inspection requests, and feedback confirmations.
          </p>
        </div>

        {notifications.some((n) => n.is_read === 0) && (
          <button
            onClick={markAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-sm">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markSingleRead(n.id, n.link)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                n.is_read === 0
                  ? 'bg-slate-900/95 border-teal-500/70 shadow-md ring-1 ring-teal-500/20'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{n.title}</span>
                  {n.is_read === 0 && (
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  )}
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
              </div>

              {n.link && (
                <span className="text-xs text-teal-400 hover:text-teal-300 font-semibold shrink-0 flex items-center gap-1">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
