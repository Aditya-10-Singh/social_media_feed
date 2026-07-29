import React, { useState } from 'react';
import { X, Image as ImageIcon, ShieldAlert, Sparkles, Lock, DollarSign, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      let mediaUrl = '';
      const token = localStorage.getItem('pulse_token');

      // 1. Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          mediaUrl = uploadData.url;
        }
      }

      // 2. Publish post
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          mediaUrl,
          isSubscriberOnly,
          isSponsored
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.reason || 'Failed to create post');
      }

      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setIsSubscriberOnly(false);
      setIsSponsored(false);

      if (onPostCreated) onPostCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-pulse-border-dark relative shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pulse-border-dark">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pulse-pink animate-pulse" />
            <h3 className="text-lg font-extrabold tracking-tight">Create Pulse</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-pulse-purple/20 text-pulse-muted hover:text-pulse-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex gap-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
              alt={user?.name}
              className="w-10 h-10 rounded-full ring-2 ring-pulse-pink/40 object-cover"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's pulsing on your mind? Use #hashtags..."
              rows={4}
              className="w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed placeholder-pulse-muted"
              autoFocus
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border border-pulse-border-dark max-h-60">
              <img src={imagePreview} alt="Upload Preview" className="w-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Toggles (Subscriber Only & Sponsored) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSubscriberOnly(!isSubscriberOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSubscriberOnly
                  ? 'bg-pulse-purple/30 text-pulse-violet border border-pulse-purple'
                  : 'bg-pulse-purple/10 text-pulse-muted hover:text-pulse-text'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {isSubscriberOnly ? 'Subscribers Only' : 'Public'}
            </button>

            <button
              type="button"
              onClick={() => setIsSponsored(!isSponsored)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSponsored
                  ? 'bg-pulse-pink/20 text-pulse-pink border border-pulse-pink/40 shadow-pink-glow'
                  : 'bg-pulse-purple/10 text-pulse-muted hover:text-pulse-text'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              {isSponsored ? 'Sponsored Boost' : 'Standard'}
            </button>
          </div>

          {/* Actions & Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-pulse-border-dark">
            <label className="flex items-center gap-2 p-2 rounded-full hover:bg-pulse-purple/20 text-pulse-pink cursor-pointer transition-colors">
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Add Image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="glow-btn px-6 py-2.5 rounded-full text-white font-extrabold text-sm shadow-pink-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Pulse</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
