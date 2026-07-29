import React, { useState } from 'react';
import { X, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalAvatar = avatar;
      const token = localStorage.getItem('pulse_token');

      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);
        const uploadRes = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) finalAvatar = uploadData.url;
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          bio,
          location,
          avatar: finalAvatar
        })
      });

      const updatedUser = await res.json();
      if (res.ok) {
        updateUser(updatedUser);
        onClose();
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-pulse-border-dark relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-pulse-purple/20 text-pulse-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold mb-4">Edit Profile</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <img
                src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                alt=""
                className="w-20 h-20 rounded-full object-cover ring-4 ring-pulse-pink/40"
              />
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6" />
                <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
              </label>
            </div>
            <p className="text-[11px] text-pulse-muted">Click image to upload new avatar</p>
          </div>

          <div>
            <label className="text-xs font-bold text-pulse-muted mb-1 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-pulse-pink"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pulse-muted mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none focus:outline-none focus:ring-1 focus:ring-pulse-pink"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pulse-muted mb-1 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-pulse-pink"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="glow-btn py-3 rounded-full text-white font-extrabold text-sm shadow-pink-glow flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>

        </form>
      </div>
    </div>
  );
};
