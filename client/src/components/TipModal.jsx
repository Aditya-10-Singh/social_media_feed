import React, { useState } from 'react';
import { X, DollarSign, Heart, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

export const TipModal = ({ isOpen, onClose, creator, onTipped }) => {
  const [amount, setAmount] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen || !creator) return null;

  const handleTipSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('pulse_token');
      const res = await fetch(`${API_URL}/api/stripe/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          creatorId: creator._id,
          amount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(data.message);
      if (onTipped) onTipped();
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-pulse-pink/40 shadow-pink-glow relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-pulse-purple/20 text-pulse-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <img
            src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`}
            alt={creator.name}
            className="w-16 h-16 rounded-full ring-4 ring-pulse-pink/40 object-cover shadow-pink-glow"
          />
          <div>
            <h3 className="font-extrabold text-lg">Tip @{creator.username}</h3>
            <p className="text-xs text-pulse-muted">Support creator content directly via Stripe</p>
          </div>

          {message && (
            <div className="p-3 rounded-2xl bg-pulse-pink/20 text-pulse-pink text-xs font-bold w-full">
              {message}
            </div>
          )}

          <form onSubmit={handleTipSubmit} className="w-full flex flex-col gap-4 mt-2">
            <div className="flex justify-center gap-3">
              {[3, 5, 10, 25].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
                    amount === val
                      ? 'bg-pulse-pink text-white shadow-pink-glow scale-105'
                      : 'bg-pulse-purple/20 text-pulse-text hover:bg-pulse-purple/40'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full glow-btn py-3 rounded-full text-white font-extrabold text-sm shadow-pink-glow flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-current" />
                  <span>Send ${amount} Tip</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
