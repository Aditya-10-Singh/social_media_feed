import React, { useState } from 'react';
import { Zap, Sun, Moon, Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

export const Navbar = ({ onOpenAuth, onSearch, currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-pulse-border-dark px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          onClick={() => setCurrentTab && setCurrentTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl glow-btn flex items-center justify-center text-white shadow-pink-glow group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pulse-pink via-pulse-violet to-pulse-cyan bg-clip-text text-transparent">
              Pulse
            </h1>
            <p className="text-[10px] text-pulse-muted uppercase tracking-widest font-semibold">Real-Time Social</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pulse-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #hashtags, posts or creators..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full glass-input focus:outline-none focus:ring-2 focus:ring-pulse-pink/50 transition-all"
            />
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-pulse-purple/20 text-pulse-muted hover:text-pulse-pink transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Auth Info / Login Trigger */}
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTab && setCurrentTab('notifications')}
                className="relative p-2 rounded-full hover:bg-pulse-purple/20 text-pulse-muted hover:text-pulse-cyan transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-pulse-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div 
                onClick={() => setCurrentTab && setCurrentTab('profile')}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-pulse-pink/40 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold leading-tight">{user.name}</p>
                  <p className="text-xs text-pulse-muted">@{user.username}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-red-500/20 text-pulse-muted hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="glow-btn px-5 py-2 text-sm font-bold text-white rounded-full shadow-pink-glow"
            >
              Sign In
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
