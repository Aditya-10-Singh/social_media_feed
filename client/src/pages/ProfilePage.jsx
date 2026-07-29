import React, { useEffect, useState } from 'react';
import { User, MapPin, Calendar, Edit3, Lock, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.username}`);
      const data = await res.json();
      if (res.ok) {
        setProfileData(data);
      }

      const postsRes = await fetch(`/api/posts?userId=${user._id}`);
      const postsData = await postsRes.json();
      if (postsRes.ok) {
        setUserPosts(postsData.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Cover & Profile Header Card */}
      <div className="glass-panel rounded-3xl border border-pulse-border-dark overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-pulse-pink via-pulse-purple to-pulse-cyan opacity-80" />

        <div className="p-6 relative pt-0">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-12 mb-4">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.name}
              className="w-24 h-24 rounded-full ring-4 ring-pulse-bg object-cover shadow-2xl bg-pulse-card-dark"
            />

            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2 rounded-full glass-input border border-pulse-border-dark text-xs font-extrabold hover:border-pulse-pink transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-pulse-pink" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{user.name}</h2>
              {user.isCreator && (
                <span className="bg-pulse-pink/20 text-pulse-pink text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                  Verified Creator
                </span>
              )}
            </div>
            <p className="text-xs text-pulse-muted">@{user.username}</p>
            <p className="text-sm mt-3 leading-relaxed max-w-xl">{user.bio}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-pulse-muted">
              {user.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-pulse-pink" /> {user.location}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pulse-cyan" /> Joined {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-pulse-border-dark">
              <div>
                <span className="text-base font-extrabold text-pulse-text">{profileData?.followersCount || 0}</span>
                <span className="text-xs text-pulse-muted ml-1.5">Followers</span>
              </div>
              <div>
                <span className="text-base font-extrabold text-pulse-text">{profileData?.followingCount || 0}</span>
                <span className="text-xs text-pulse-muted ml-1.5">Following</span>
              </div>
              <div>
                <span className="text-base font-extrabold text-pulse-text">{userPosts.length}</span>
                <span className="text-xs text-pulse-muted ml-1.5">Pulses</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Creator Membership Banner */}
      <div className="glass-card p-5 rounded-3xl border border-pulse-pink/30 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-sm text-pulse-pink flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Creator Monthly Membership
          </h4>
          <p className="text-xs text-pulse-muted mt-1">Unlock exclusive subscriber-only pulses & badge for $4.99/mo.</p>
        </div>
        <button
          onClick={() => setSubscribed(!subscribed)}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-pink-glow ${
            subscribed ? 'bg-pulse-purple/30 text-pulse-violet border border-pulse-purple' : 'glow-btn text-white'
          }`}
        >
          {subscribed ? 'Subscribed ⭐' : 'Subscribe $4.99'}
        </button>
      </div>

      {/* User Posts Timeline */}
      <div className="flex flex-col gap-4">
        <h3 className="font-extrabold text-base border-b border-pulse-border-dark pb-2">Pulses by @{user.username}</h3>
        {userPosts.length > 0 ? (
          userPosts.map(post => (
            <PostCard key={post._id} post={post} onPostUpdated={fetchProfile} />
          ))
        ) : (
          <p className="text-xs text-pulse-muted italic text-center py-8">No pulses posted yet.</p>
        )}
      </div>

      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />

    </div>
  );
};
