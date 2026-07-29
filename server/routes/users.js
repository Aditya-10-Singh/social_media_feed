import express from 'express';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendPushNotification } from '../utils/webPush.js';

const router = express.Router();

// GET User Profile by Username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.username || req.params.username.toLowerCase() })
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const postsCount = await Post.countDocuments({ author: user._id });

    res.json({
      user,
      postsCount,
      followersCount: user.followers.length,
      followingCount: user.following.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading user profile' });
  }
});

// FOLLOW / UNFOLLOW User
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUser._id);

      // Notification
      const notif = new Notification({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow'
      });
      await notif.save();

      const populatedNotif = await Notification.findById(notif._id).populate('sender', 'name username avatar');
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user:${targetUser._id.toString()}`).emit('notification:new', populatedNotif);
      }

      // Web Push
      if (targetUser.pushSubscription) {
        sendPushNotification(targetUser.pushSubscription, {
          title: 'New Follower on Pulse! ✨',
          body: `${currentUser.name} (@${currentUser.username}) started following you!`,
          url: `/user/${currentUser.username}`
        });
      }
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing follow/unfollow request' });
  }
});

// UPDATE User Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, bio, location, website, avatar, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (avatar) user.avatar = avatar;
    if (theme) user.theme = theme;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// GET Suggested Accounts to Follow
router.get('/meta/suggested', authMiddleware, async (req, res) => {
  try {
    const suggested = await User.find({
      _id: { $ne: req.user._id, $nin: req.user.following }
    })
      .select('name username avatar bio isCreator')
      .limit(5);

    res.json(suggested);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggested users' });
  }
});

export default router;
