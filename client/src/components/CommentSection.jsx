import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CommentSection = ({ post, onCommentAdded }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('pulse_token');
      const res = await fetch(`/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await res.json();
      if (res.ok) {
        setContent('');
        if (onCommentAdded) onCommentAdded(data);
      }
    } catch (err) {
      console.error('Comment submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-pulse-border-dark flex flex-col gap-4">
      
      {/* Existing Comments List */}
      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment, idx) => (
            <div key={idx} className="flex gap-2.5 items-start bg-pulse-purple/10 p-3 rounded-2xl">
              <img
                src={comment.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username}`}
                alt={comment.user?.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-pulse-pink/30 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{comment.user?.name || 'User'}</span>
                  <span className="text-[10px] text-pulse-muted">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs mt-0.5 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-pulse-muted italic text-center py-2">No comments yet. Start the conversation!</p>
        )}
      </div>

      {/* Comment Input */}
      {user && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 text-xs rounded-full glass-input focus:outline-none focus:ring-1 focus:ring-pulse-pink"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="p-2 rounded-full glow-btn text-white disabled:opacity-50 transition-all shadow-pink-glow"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      )}

    </div>
  );
};
