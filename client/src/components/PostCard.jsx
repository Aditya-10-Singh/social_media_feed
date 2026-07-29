import React, { useState } from 'react';
import { Heart, MessageSquare, Repeat, Bookmark, DollarSign, ShieldAlert, Sparkles, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './CommentSection';
import { TipModal } from './TipModal';

export const PostCard = ({ post, onPostUpdated, onHashtagClick }) => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [hasLiked, setHasLiked] = useState(() => {
    return user && post.likes ? post.likes.some(id => id === user._id || id._id === user._id) : false;
  });
  const [isBookmarked, setIsBookmarked] = useState(() => {
    return user && user.bookmarks ? user.bookmarks.includes(post._id) : false;
  });
  const [showComments, setShowComments] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);

  const handleLike = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('pulse_token');
      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLikesCount(data.likesCount);
        setHasLiked(data.hasLiked);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('pulse_token');
      const res = await fetch(`/api/posts/${post._id}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIsBookmarked(data.isBookmarked);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleRepost = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('pulse_token');
      const res = await fetch(`/api/posts/${post._id}/repost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: `Reposted from @${post.author?.username}` })
      });
      if (res.ok) {
        setRepostCount(prev => prev + 1);
        if (onPostUpdated) onPostUpdated();
      }
    } catch (err) {
      console.error('Repost error:', err);
    }
  };

  // Helper to highlight #hashtags
  const renderFormattedContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[\w]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('#')) {
        const cleanTag = part.replace('#', '');
        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              if (onHashtagClick) onHashtagClick(cleanTag);
            }}
            className="text-pulse-pink hover:text-pulse-cyan cursor-pointer font-bold transition-colors"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="glass-card rounded-3xl p-5 border border-pulse-border-dark hover:border-pulse-pink/30 transition-all duration-300 shadow-glass mb-4">
      
      {/* Sponsored Header Badge */}
      {post.isSponsored && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-pulse-pink bg-pulse-pink/10 px-3 py-1 rounded-full w-fit mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sponsored Content</span>
        </div>
      )}

      {/* AI Moderation Flag Warning */}
      {post.moderation?.flagged && (
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs mb-3">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>AI Moderation Flag: Content safety check applied</span>
        </div>
      )}

      {/* Author Details */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`}
            alt={post.author?.name}
            className="w-10 h-10 rounded-full ring-2 ring-pulse-pink/40 object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm leading-tight hover:text-pulse-pink transition-colors cursor-pointer">
                {post.author?.name}
              </h4>
              {post.author?.isCreator && (
                <span className="text-[10px] bg-pulse-purple/30 text-pulse-violet px-2 py-0.5 rounded-full font-bold">
                  Creator
                </span>
              )}
            </div>
            <p className="text-xs text-pulse-muted">@{post.author?.username}</p>
          </div>
        </div>

        <span className="text-xs text-pulse-muted">
          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Post Text */}
      <div className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">
        {renderFormattedContent(post.content)}
      </div>

      {/* Post Image Media */}
      {post.mediaUrl && (
        <div className="rounded-2xl overflow-hidden mb-3 border border-pulse-border-dark max-h-96">
          <img
            src={post.mediaUrl}
            alt="Pulse attachment"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Quoted Post Reference */}
      {post.quotedPost && (
        <div className="p-3.5 rounded-2xl bg-pulse-purple/10 border border-pulse-purple/30 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={post.quotedPost.author?.avatar}
              alt=""
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs font-bold">{post.quotedPost.author?.name}</span>
            <span className="text-[10px] text-pulse-muted">@{post.quotedPost.author?.username}</span>
          </div>
          <p className="text-xs text-pulse-muted line-clamp-2">{post.quotedPost.content}</p>
        </div>
      )}

      {/* Interaction Toolbar */}
      <div className="flex items-center justify-between pt-3 border-t border-pulse-border-dark text-pulse-muted">
        
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
            hasLiked ? 'text-pulse-pink scale-105' : 'hover:text-pulse-pink'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs font-bold hover:text-pulse-cyan transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{post.comments?.length || 0}</span>
        </button>

        {/* Repost */}
        <button
          onClick={handleRepost}
          className="flex items-center gap-1.5 text-xs font-bold hover:text-pulse-violet transition-colors"
        >
          <Repeat className="w-4 h-4" />
          <span>{repostCount}</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`p-1.5 rounded-full transition-colors ${
            isBookmarked ? 'text-pulse-cyan' : 'hover:text-pulse-cyan'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Tip Creator (Stripe Monetization) */}
        {post.author?._id !== user?._id && (
          <button
            onClick={() => setShowTipModal(true)}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-pulse-pink/10 text-pulse-pink hover:bg-pulse-pink hover:text-white transition-all shadow-pink-glow"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Tip</span>
          </button>
        )}

      </div>

      {/* Comment Section Drawer */}
      {showComments && (
        <CommentSection
          post={post}
          onCommentAdded={(newComment) => {
            post.comments.push(newComment);
            if (onPostUpdated) onPostUpdated();
          }}
        />
      )}

      {/* Tip Creator Modal */}
      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          creator={post.author}
        />
      )}

    </article>
  );
};
