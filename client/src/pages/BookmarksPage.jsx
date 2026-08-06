import React, { useEffect, useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { API_URL } from '../config';

export const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    const token = localStorage.getItem('pulse_token');
    fetch(`${API_URL}/api/posts/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookmarks(data || []);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 pb-4 border-b border-pulse-border-dark">
        <Bookmark className="w-6 h-6 text-pulse-cyan" />
        <h2 className="text-xl font-extrabold tracking-tight">Saved Bookmarks</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-pulse-pink">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {bookmarks.map(post => (
            <PostCard key={post._id} post={post} onPostUpdated={fetchBookmarks} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center text-pulse-muted border border-pulse-border-dark py-16">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-40 text-pulse-cyan" />
          <h3 className="text-base font-extrabold text-pulse-text">No bookmarks saved yet</h3>
          <p className="text-xs mt-1">Save pulses privately to read or reference them anytime!</p>
        </div>
      )}
    </div>
  );
};
