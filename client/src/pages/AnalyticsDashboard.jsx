import React, { useEffect, useState } from 'react';
import { BarChart3, Eye, Heart, MessageSquare, DollarSign, TrendingUp, Award, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pulse_token');
    fetch(`${API_URL}/api/stripe/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-pulse-border-dark">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-pulse-pink" />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Creator Analytics</h2>
            <p className="text-xs text-pulse-muted">Performance, engagement rates, and Stripe earnings overview</p>
          </div>
        </div>
        <span className="bg-pulse-pink/20 text-pulse-pink text-xs px-3 py-1 rounded-full font-bold">
          Pro Dashboard
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-3xl border border-pulse-border-dark flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-pulse-pink/10 text-pulse-pink w-fit">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-xs text-pulse-muted font-bold">Total Reach</span>
          <span className="text-2xl font-black">{analytics?.totalImpressions || 1240}</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-pulse-border-dark flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-pulse-purple/20 text-pulse-violet w-fit">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs text-pulse-muted font-bold">Engagement Rate</span>
          <span className="text-2xl font-black">{analytics?.engagementRate || '4.85%'}</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-pulse-border-dark flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-pulse-cyan/10 text-pulse-cyan w-fit">
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-xs text-pulse-muted font-bold">Total Interactions</span>
          <span className="text-2xl font-black">{(analytics?.totalLikes || 0) + (analytics?.totalComments || 0)}</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-pulse-pink/40 shadow-pink-glow flex flex-col gap-2">
          <div className="p-2 rounded-xl bg-pulse-pink text-white w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs text-pulse-muted font-bold">Estimated Earnings</span>
          <span className="text-2xl font-black text-pulse-pink">${analytics?.estimatedEarnings || '49.95'}</span>
        </div>

      </div>

      {/* Top Performing Pulses */}
      <div className="glass-panel p-5 rounded-3xl border border-pulse-border-dark">
        <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-pulse-pink" />
          <span>Top Performing Content</span>
        </h3>

        {analytics?.topPosts && analytics.topPosts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {analytics.topPosts.map((post, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-pulse-purple/10 border border-pulse-border-dark">
                <p className="text-xs font-semibold truncate flex-1 pr-4">{post.content}</p>
                <div className="flex items-center gap-4 text-xs font-bold text-pulse-muted flex-shrink-0">
                  <span className="flex items-center gap-1 text-pulse-pink"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                  <span className="flex items-center gap-1 text-pulse-cyan"><MessageSquare className="w-3.5 h-3.5" /> {post.comments}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-pulse-muted italic">Create more pulses to generate deep analytics!</p>
        )}
      </div>

    </div>
  );
};
