import React, { useEffect, useState } from 'react';
import { Bell, Heart, MessageSquare, UserPlus, DollarSign, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config';

export const NotificationCenter = () => {
  const { setUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pulse_token');
    fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
        setUnreadCount(0);
      })
      .catch(err => setLoading(false));
  }, [setUnreadCount]);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-pulse-pink fill-current" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-pulse-cyan" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-pulse-violet" />;
      case 'tip': return <DollarSign className="w-5 h-5 text-green-400" />;
      default: return <Sparkles className="w-5 h-5 text-pulse-pink" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-4 border-b border-pulse-border-dark">
        <Bell className="w-6 h-6 text-pulse-pink" />
        <h2 className="text-xl font-extrabold tracking-tight">Notifications</h2>
      </div>

      {loading ? (
        <p className="text-xs text-pulse-muted">Loading activity feed...</p>
      ) : notifications.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className="glass-card p-4 rounded-2xl border border-pulse-border-dark flex items-center gap-3.5 hover:border-pulse-pink/30 transition-colors"
            >
              <div className="p-2 rounded-full bg-pulse-purple/20 flex-shrink-0">
                {getNotifIcon(notif.type)}
              </div>
              <img
                src={notif.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.sender?.username}`}
                alt=""
                className="w-9 h-9 rounded-full object-cover ring-1 ring-pulse-pink/30"
              />
              <div className="flex-1">
                <p className="text-xs font-bold">
                  {notif.sender?.name} <span className="text-pulse-muted font-normal">@{notif.sender?.username}</span>
                </p>
                <p className="text-xs text-pulse-muted mt-0.5">
                  {notif.type === 'like' && 'liked your pulse'}
                  {notif.type === 'comment' && 'commented on your pulse'}
                  {notif.type === 'follow' && 'started following you'}
                  {notif.type === 'tip' && 'sent you a tip! 💸'}
                </p>
              </div>
              <span className="text-[10px] text-pulse-muted">
                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-pulse-muted">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No notifications yet</p>
        </div>
      )}
    </div>
  );
};
