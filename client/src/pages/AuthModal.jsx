import React, { useState } from 'react';
import { X, Zap, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isLoginView) {
        await login(email || username, password);
      } else {
        await register(username, name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-pulse-pink/40 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-pulse-purple/20 text-pulse-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl glow-btn flex items-center justify-center text-white shadow-pink-glow">
            <Zap className="w-7 h-7 fill-current animate-pulse" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-pulse-pink via-pulse-violet to-pulse-cyan bg-clip-text text-transparent">
            {isLoginView ? 'Welcome Back to Pulse' : 'Join the Real-Time Feed'}
          </h2>
          <p className="text-xs text-pulse-muted">
            {isLoginView ? 'Sign in to post, like, comment, and connect' : 'Create an account to join the conversation'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {!isLoginView && (
            <>
              <div>
                <label className="text-xs font-bold text-pulse-muted mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pulse-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-pulse-pink"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-pulse-muted mb-1 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pulse-muted" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="aditya_pulse"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-pulse-pink"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-pulse-muted mb-1 block">
              {isLoginView ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pulse-muted" />
              <input
                type="text"
                required
                value={isLoginView ? (email || username) : email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isLoginView) setUsername(e.target.value);
                }}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-pulse-pink"
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Eye Option */}
          <div>
            <label className="text-xs font-bold text-pulse-muted mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pulse-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-pulse-pink"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pulse-muted hover:text-pulse-pink transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full glow-btn py-3 rounded-full text-white font-extrabold text-sm shadow-pink-glow flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isLoginView ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-pulse-muted">
          {isLoginView ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setIsLoginView(false); setError(null); }}
                className="text-pulse-pink font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setIsLoginView(true); setError(null); }}
                className="text-pulse-pink font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
