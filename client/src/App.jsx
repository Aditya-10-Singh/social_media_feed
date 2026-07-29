import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightBar } from './components/RightBar';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './pages/AuthModal';

import { FeedPage } from './pages/FeedPage';
import { TrendingPage } from './pages/TrendingPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotificationCenter } from './components/NotificationCenter';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ProfilePage } from './pages/ProfilePage';

import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedTag, setSelectedTag] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Service Worker Registration for Web Push Notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered:', reg.scope))
        .catch(err => console.log('SW registration error:', err));
    }
  }, []);

  const handleSelectHashtag = (tag) => {
    setSelectedTag(tag);
    setCurrentTab('trending');
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <FeedPage onHashtagClick={handleSelectHashtag} />;
      case 'trending':
        return <TrendingPage initialTag={selectedTag} onSelectTag={setSelectedTag} />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'notifications':
        return <NotificationCenter />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <FeedPage onHashtagClick={handleSelectHashtag} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-pulse-bg text-pulse-text font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onSearch={(query) => {
          if (query.startsWith('#')) {
            handleSelectHashtag(query.replace('#', ''));
          } else {
            setCurrentTab('trending');
          }
        }}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex justify-center gap-6 px-2 sm:px-4 py-4">
        
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenCreatePost={() => {
            if (!user) {
              setIsAuthOpen(true);
            } else {
              setIsCreatePostOpen(true);
            }
          }}
        />

        {/* Center Main Content Timeline */}
        <main className="flex-1 max-w-2xl min-w-0">
          {renderTabContent()}
        </main>

        {/* Right Sidebar */}
        <RightBar
          onSelectHashtag={handleSelectHashtag}
          onSelectUser={() => setCurrentTab('profile')}
        />

      </div>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => {
          if (!user) setIsAuthOpen(true);
          else setIsCreatePostOpen(true);
        }}
        className="md:hidden fixed bottom-6 right-6 z-40 glow-btn p-4 rounded-full text-white shadow-pink-glow"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={() => setCurrentTab('home')}
      />

    </div>
  );
}
