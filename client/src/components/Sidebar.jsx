import React from 'react';
import { Home, Hash, Bookmark, Bell, BarChart3, User, PlusCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentTab, setCurrentTab, onOpenCreatePost, onRequireAuth }) => {
  const { user } = useAuth();
  const { unreadCount } = useSocket();

  const navItems = [
    { id: 'home', label: 'Home Feed', icon: Home, public: true },
    { id: 'trending', label: 'Explore & Trends', icon: Hash, public: true },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, public: false },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount, public: false },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3, public: false },
    { id: 'profile', label: 'Profile', icon: User, public: false },
  ];

  const handleTabClick = (item) => {
    if (!item.public && !user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setCurrentTab(item.id);
  };

  return (
    <aside className="w-64 hidden md:flex flex-col gap-2 p-4 sticky top-16 h-[calc(100vh-4rem)] border-r border-pulse-border-dark">
      <div className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pulse-pink/20 to-pulse-purple/20 text-pulse-pink border border-pulse-pink/40 shadow-pink-glow'
                  : 'text-pulse-muted hover:text-pulse-text hover:bg-pulse-purple/10'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={`w-5 h-5 ${isActive ? 'text-pulse-pink' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && user && (
                <span className="bg-pulse-pink text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={onOpenCreatePost}
          className="w-full glow-btn py-3 px-4 rounded-2xl text-white font-extrabold text-sm shadow-pink-glow flex items-center justify-center gap-2 group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Pulse</span>
        </button>
      </div>

      {/* Footer info */}
      <div className="mt-auto pt-4 border-t border-pulse-border-dark text-[11px] text-pulse-muted text-center leading-relaxed">
        <p className="font-semibold text-pulse-violet">Pulse v1.0.0 • MERN Engine</p>
        <p className="mt-0.5">Real-time Sockets & Web Push</p>
      </div>
    </aside>
  );
};
