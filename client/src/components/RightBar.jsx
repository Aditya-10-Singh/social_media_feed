import React, { useEffect, useState } from 'react';
import { TrendingUp, UserPlus, Sparkles, DollarSign, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export const RightBar = ({ onSelectHashtag, onSelectUser }) => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    // Fetch Trending Hashtags
    fetch(`${API_URL}/api/trending/hashtags`)
      .then(res => res.json())
      .then(data => setTrending(data))
      .catch(err => console.error(err));

    // Fetch Suggested Creators
    if (user) {
      fetch(`${API_URL}/api/users/meta/suggested`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pulse_token')}` }
      })
        .then(res => res.json())
        .then(data => setSuggested(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleFollowToggle = async (userId) => {
    try {
      const token = localStorage.getItem('pulse_token');
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFollowingMap(prev => ({ ...prev, [userId]: data.isFollowing }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-80 hidden lg:flex flex-col gap-6 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      
      {/* Live Hashtags Trending Panel */}
      <div className="glass-panel p-4 rounded-3xl border border-pulse-border-dark">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pulse-pink animate-bounce" />
            <h3 className="font-extrabold text-base tracking-tight">Trending Topics</h3>
          </div>
          <span className="text-[10px] uppercase font-bold text-pulse-cyan bg-pulse-cyan/10 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {trending.length > 0 ? (
            trending.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectHashtag && onSelectHashtag(item.tag)}
                className="group flex items-center justify-between p-2 rounded-xl hover:bg-pulse-purple/10 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-xs text-pulse-muted font-semibold">#{idx + 1} Trending</p>
                  <p className="text-sm font-extrabold group-hover:text-pulse-pink transition-colors">
                    #{item.tag}
                  </p>
                </div>
                <span className="text-xs font-bold text-pulse-violet bg-pulse-purple/20 px-2.5 py-1 rounded-full">
                  {item.count} posts
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-pulse-muted italic">No trending topics yet. Be the first to post with #hashtags!</p>
          )}
        </div>
      </div>

      {/* Suggested Creators Panel */}
      {user && suggested.length > 0 && (
        <div className="glass-panel p-4 rounded-3xl border border-pulse-border-dark">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-pulse-cyan" />
            <h3 className="font-extrabold text-base tracking-tight">Who to Follow</h3>
          </div>

          <div className="flex flex-col gap-3.5">
            {suggested.map((creator) => {
              const isFollowing = followingMap[creator._id];
              return (
                <div key={creator._id} className="flex items-center justify-between gap-2">
                  <div 
                    onClick={() => onSelectUser && onSelectUser(creator.username)}
                    className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`}
                      alt={creator.name}
                      className="w-9 h-9 rounded-full ring-1 ring-pulse-pink/30 object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold truncate hover:text-pulse-pink transition-colors">
                        {creator.name}
                      </p>
                      <p className="text-[11px] text-pulse-muted truncate">@{creator.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollowToggle(creator._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      isFollowing
                        ? 'bg-pulse-purple/20 text-pulse-violet border border-pulse-purple/40'
                        : 'glow-btn text-white shadow-pink-glow'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3" />
                        Following
                      </>
                    ) : (
                      'Follow'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Creator Monetization Promo Box */}
      <div className="glass-card p-4 rounded-3xl border border-pulse-pink/30 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-pulse-pink/20 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2 text-pulse-pink">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h4 className="font-extrabold text-sm uppercase tracking-wider">Creator Economy</h4>
        </div>
        <p className="text-xs text-pulse-muted mb-3 leading-relaxed">
          Unlock monthly subscriber-only posts, accept Stripe tips, and boost posts to millions.
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-pulse-border-dark text-xs font-bold text-pulse-cyan">
          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Instant Payouts</span>
          <span className="bg-pulse-pink/20 text-pulse-pink px-2 py-0.5 rounded-full">Stripe Verified</span>
        </div>
      </div>

    </aside>
  );
};
