import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Sparkles, Users, Loader2 } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { useSocket } from '../context/SocketContext';
import { API_URL } from '../config';

export const FeedPage = ({ onHashtagClick, onRequireAuth }) => {
  const { socket } = useSocket();
  const [feedType, setFeedType] = useState('forYou'); // 'forYou' | 'following'
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeedPosts = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setNextCursor(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const cursorParam = reset ? '' : (nextCursor ? `&cursor=${nextCursor}` : '');
      const token = localStorage.getItem('pulse_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/api/posts?feedType=${feedType}&limit=10${cursorParam}`, { headers });
      const data = await res.json();

      if (res.ok) {
        if (reset) {
          setPosts(data.posts || []);
        } else {
          setPosts(prev => [...prev, ...(data.posts || [])]);
        }
        setNextCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts(true);
  }, [feedType]);

  // Real-Time Socket post injection listener
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      setPosts(prev => [newPost, ...prev]);
    };

    const handleUpdatedPost = (updatedData) => {
      setPosts(prev => prev.map(p => {
        if (p._id === updatedData.postId) {
          return {
            ...p,
            likes: updatedData.likes !== undefined ? updatedData.likes : p.likes,
            comments: updatedData.comments !== undefined ? updatedData.comments : p.comments
          };
        }
        return p;
      }));
    };

    socket.on('post:created', handleNewPost);
    socket.on('post:updated', handleUpdatedPost);

    return () => {
      socket.off('post:created', handleNewPost);
      socket.off('post:updated', handleUpdatedPost);
    };
  }, [socket]);

  // Infinite Scroll Observer
  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchFeedPosts(false);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, nextCursor]);

  return (
    <div className="flex flex-col gap-4">
      
      {/* Feed Mode Switcher */}
      <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-2 border border-pulse-border-dark mb-2">
        <button
          onClick={() => setFeedType('forYou')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            feedType === 'forYou'
              ? 'bg-gradient-to-r from-pulse-pink to-pulse-purple text-white shadow-pink-glow'
              : 'text-pulse-muted hover:text-pulse-text'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>For You (Ranked)</span>
        </button>

        <button
          onClick={() => setFeedType('following')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            feedType === 'following'
              ? 'bg-gradient-to-r from-pulse-pink to-pulse-purple text-white shadow-pink-glow'
              : 'text-pulse-muted hover:text-pulse-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Following</span>
        </button>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-pulse-pink gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs font-bold tracking-wide">Loading Pulse Feed...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="flex flex-col">
          {posts.map((post, idx) => {
            const isLast = idx === posts.length - 1;
            return (
              <div key={post._id} ref={isLast ? lastPostRef : null}>
                <PostCard
                  post={post}
                  onHashtagClick={onHashtagClick}
                  onRequireAuth={onRequireAuth}
                  onPostUpdated={() => fetchFeedPosts(true)}
                />
              </div>
            );
          })}

          {loadingMore && (
            <div className="flex justify-center py-4 text-pulse-pink">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center text-pulse-muted border border-pulse-border-dark py-16">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40 text-pulse-pink" />
          <h3 className="text-base font-extrabold text-pulse-text">No pulses found</h3>
          <p className="text-xs mt-1">Be the first creator to share a post on Pulse!</p>
        </div>
      )}

    </div>
  );
};
