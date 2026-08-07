import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Edit3, Check, Sparkles, UserPlus, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { TipModal } from '../components/TipModal';
import { API_URL } from '../config';

export const ProfilePage = ({ username: propUsername, onRequireAuth, onSelectHashtag, onSelectUser }) => {
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [profileStats, setProfileStats] = useState({ followersCount: 0, followingCount: 0, postsCount: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const targetUsername = propUsername || currentUser?.username;
  const isOwnProfile = currentUser && profileUser && currentUser._id === profileUser._id;

  const fetchProfileData = async () => {
    if (!targetUsername) return;
    setLoading(true);
    try {
      // 1. Fetch target user profile by username
      const res = await fetch(`${API_URL}/api/users/${targetUsername}`);
      const data = await res.json();

      if (res.ok && data.user) {
        setProfileUser(data.user);
        setProfileStats({
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          postsCount: data.postsCount || 0
        });

        if (currentUser && data.user.followers) {
          const isFollowed = data.user.followers.some(f => f._id === currentUser._id || f === currentUser._id);
          setIsFollowing(isFollowed);
        }

        // 2. Fetch posts by target user ID
        const postsRes = await fetch(`${API_URL}/api/posts?userId=${data.user._id}`);
        const postsData = await postsRes.json();
        if (postsRes.ok) {
          setUserPosts(postsData.posts || []);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [targetUsername, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    try {
      const token = localStorage.getItem('pulse_token');
      const res = await fetch(`${API_URL}/api/users/${profileUser._id}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setProfileStats(prev => ({ ...prev, followersCount: data.followersCount }));
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-pulse-pink gap-2">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-bold">Loading Profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center text-pulse-muted border border-pulse-border-dark py-16">
        <h3 className="text-base font-extrabold text-pulse-text">User Profile Not Found</h3>
        <p className="text-xs mt-1">The user @{targetUsername} does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Cover & Profile Header Card */}
      <div className="glass-panel rounded-3xl border border-pulse-border-dark overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-pulse-pink via-pulse-purple to-pulse-cyan opacity-80" />

        <div className="p-6 relative pt-0">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-12 mb-4">
            <img
              src={profileUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`}
              alt={profileUser.name}
              className="w-24 h-24 rounded-full ring-4 ring-pulse-bg object-cover shadow-2xl bg-pulse-card-dark"
            />

            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-5 py-2 rounded-full glass-input border border-pulse-border-dark text-xs font-extrabold hover:border-pulse-pink transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 text-pulse-pink" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    isFollowing
                      ? 'bg-pulse-purple/30 text-pulse-violet border border-pulse-purple'
                      : 'glow-btn text-white shadow-pink-glow'
                  }`}
                >
                  {isFollowing ? (
                    <><Check className="w-4 h-4" /> Following</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Follow</>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!currentUser && onRequireAuth) onRequireAuth();
                    else setShowTipModal(true);
                  }}
                  className="px-4 py-2 rounded-full bg-pulse-pink/10 text-pulse-pink border border-pulse-pink/30 text-xs font-extrabold hover:bg-pulse-pink hover:text-white transition-all shadow-pink-glow flex items-center gap-1"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Tip</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{profileUser.name}</h2>
              {profileUser.isCreator && (
                <span className="bg-pulse-pink/20 text-pulse-pink text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                  Verified Creator
                </span>
              )}
            </div>
            <p className="text-xs text-pulse-muted">@{profileUser.username}</p>
            <p className="text-sm mt-3 leading-relaxed max-w-xl">{profileUser.bio}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-pulse-muted">
              {profileUser.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-pulse-pink" /> {profileUser.location}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pulse-cyan" /> Joined {new Date(profileUser.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-pulse-border-dark">
              <div>
                <span className="text-base font-extrabold text-pulse-text">{profileStats.followersCount}</span>
                <span className="text-xs text-pulse-muted ml-1.5">Followers</span>
              </div>
              <div>
                <span className="text-base font-extrabold text-pulse-text">{profileStats.followingCount}</span>
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
      {!isOwnProfile && (
        <div className="glass-card p-5 rounded-3xl border border-pulse-pink/30 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-sm text-pulse-pink flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Creator Monthly Membership
            </h4>
            <p className="text-xs text-pulse-muted mt-1">Unlock exclusive subscriber-only pulses from @{profileUser.username} for $4.99/mo.</p>
          </div>
          <button
            onClick={() => {
              if (!currentUser && onRequireAuth) onRequireAuth();
              else setSubscribed(!subscribed);
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-pink-glow ${
              subscribed ? 'bg-pulse-purple/30 text-pulse-violet border border-pulse-purple' : 'glow-btn text-white'
            }`}
          >
            {subscribed ? 'Subscribed ⭐' : 'Subscribe $4.99'}
          </button>
        </div>
      )}

      {/* User Posts Timeline */}
      <div className="flex flex-col gap-4">
        <h3 className="font-extrabold text-base border-b border-pulse-border-dark pb-2">Pulses by @{profileUser.username}</h3>
        {userPosts.length > 0 ? (
          userPosts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onHashtagClick={onSelectHashtag}
              onRequireAuth={onRequireAuth}
              onPostUpdated={fetchProfileData}
            />
          ))
        ) : (
          <p className="text-xs text-pulse-muted italic text-center py-8">No pulses posted yet.</p>
        )}
      </div>

      {isOwnProfile && (
        <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
      )}

      {showTipModal && (
        <TipModal isOpen={showTipModal} onClose={() => setShowTipModal(false)} creator={profileUser} />
      )}

    </div>
  );
};
