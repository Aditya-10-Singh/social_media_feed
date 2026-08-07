import React, { useEffect, useState } from 'react';
import { Hash, TrendingUp, Search } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { API_URL } from '../config';

export const TrendingPage = ({ initialTag, onSelectTag }) => {
  const [activeTag, setActiveTag] = useState(initialTag || '');
  const [trending, setTrending] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/trending/hashtags`)
      .then(res => res.json())
      .then(data => setTrending(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeTag) {
      setLoading(true);
      fetch(`${API_URL}/api/posts?tag=${activeTag}`)
        .then(res => res.json())
        .then(data => {
          setPosts(data.posts || []);
          setLoading(false);
        })
        .catch(err => setLoading(false));
    }
  }, [activeTag]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 pb-4 border-b border-pulse-border-dark">
        <Hash className="w-6 h-6 text-pulse-pink animate-pulse" />
        <h2 className="text-xl font-extrabold tracking-tight">Explore & Hashtag Trends</h2>
      </div>

      {/* Trending Pills */}
      <div className="flex flex-wrap gap-2">
        {trending.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTag(item.tag)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTag === item.tag
                ? 'bg-pulse-pink text-white shadow-pink-glow scale-105'
                : 'glass-panel text-pulse-muted hover:text-pulse-text hover:border-pulse-pink/40'
            }`}
          >
            #{item.tag} ({item.count})
          </button>
        ))}
      </div>

      {/* Filtered Feed */}
      {activeTag ? (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-pulse-cyan">
            Showing pulses tagged with #{activeTag}
          </h3>
          {posts.length > 0 ? (
            posts.map(post => <PostCard key={post._id} post={post} />)
          ) : (
            <p className="text-xs text-pulse-muted italic py-8 text-center">No posts found with this hashtag.</p>
          )}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center text-pulse-muted border border-pulse-border-dark py-16">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-pulse-pink opacity-50" />
          <p className="text-sm font-bold text-pulse-text">Select a hashtag above to explore trending content</p>
        </div>
      )}
    </div>
  );
};
