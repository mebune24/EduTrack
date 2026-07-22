import { useState, useRef, useEffect } from 'react';
import { Bell, BellDot, CheckCheck, ExternalLink, Award, CreditCard, CheckCircle2, MessageSquare, Info } from 'lucide-react';
import type { AppNotification, NotificationType } from '../../types';
import { useNavigate } from 'react-router-dom';

// ─── Mock notifications ───────────────────────────────────────────────────────
// In production these would be fetched from Firestore in real-time using onSnapshot
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    recipientId: 'demo',
    type: 'results_published',
    title: 'Term 2 Results Available 📊',
    message: 'Your Term 2 results have been published. Average: 79.7% · Rank: 1/35.',
    link: '/results',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: 'n2',
    recipientId: 'demo',
    type: 'payment_confirmed',
    title: 'Payment Confirmed ✅',
    message: 'Payment of 50,000 FCFA confirmed via MTN MoMo. Ref: MM-2026-001234.',
    link: '/fees',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hrs ago
  },
  {
    id: 'n3',
    recipientId: 'demo',
    type: 'complaint_update',
    title: 'Complaint TKT-001 Updated',
    message: 'Admin has responded to your complaint about missing Mathematics marks.',
    link: '/complaints',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'n4',
    recipientId: 'demo',
    type: 'registration_approved',
    title: 'Application Approved! 🎉',
    message: 'Your admission application has been approved. Matricule: EDUT260042.',
    link: '/apply',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'n5',
    recipientId: 'demo',
    type: 'general',
    title: 'PTA Meeting Reminder',
    message: 'The PTA meeting is scheduled for July 27th at 10:00 AM in the main hall.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
];

function typeIcon(type: NotificationType) {
  switch (type) {
    case 'results_published':   return <Award className="w-4 h-4 text-blue-500" />;
    case 'payment_confirmed':   return <CreditCard className="w-4 h-4 text-green-500" />;
    case 'registration_approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'complaint_update':    return <MessageSquare className="w-4 h-4 text-orange-500" />;
    default:                    return <Info className="w-4 h-4 text-slate-400" />;
  }
}

function typeColor(type: NotificationType) {
  switch (type) {
    case 'results_published':     return 'bg-blue-50';
    case 'payment_confirmed':     return 'bg-green-50';
    case 'registration_approved': return 'bg-emerald-50';
    case 'complaint_update':      return 'bg-orange-50';
    default:                      return 'bg-slate-50';
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unread = notifications.filter(n => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (n: AppNotification) => {
    markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        title="Notifications"
        aria-label={`Notifications, ${unread} unread`}
      >
        {unread > 0 ? <BellDot className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gray-800" />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[9999] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notifications
              {unread > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-blue-50/40' : ''}`}
                >
                  {/* Icon */}
                  <div className={`shrink-0 p-2 rounded-xl mt-0.5 ${typeColor(n.type)}`}>
                    {typeIcon(n.type)}
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                      {n.link && (
                        <span className="text-xs text-primary flex items-center gap-0.5">
                          View <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-center">
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate-500 hover:text-primary font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
