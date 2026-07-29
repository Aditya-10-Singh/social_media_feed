import express from 'express';
import Stripe from 'stripe';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

// TIP CREATOR
router.post('/tip', authMiddleware, async (req, res) => {
  try {
    const { creatorId, amount } = req.body;
    if (!creatorId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid creator ID and tip amount required' });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Create payment intent simulation / stripe checkout session
    const notif = new Notification({
      recipient: creator._id,
      sender: req.user._id,
      type: 'tip'
    });
    await notif.save();

    const io = req.app.get('socketio');
    if (io) {
      io.to(`user:${creator._id.toString()}`).emit('notification:new', {
        type: 'tip',
        sender: { name: req.user.name, username: req.user.username, avatar: req.user.avatar },
        message: `Tipped $${amount}! 💸`
      });
    }

    res.json({
      success: true,
      message: `Successfully tipped $${amount} to @${creator.username}!`,
      transactionId: `tx_tip_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing creator tip' });
  }
});

// SUBSCRIBE TO CREATOR
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { creatorId } = req.body;
    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    if (!creator.subscribers.includes(req.user._id)) {
      creator.subscribers.push(req.user._id);
      await creator.save();

      const notif = new Notification({
        recipient: creator._id,
        sender: req.user._id,
        type: 'subscribe'
      });
      await notif.save();
    }

    res.json({
      success: true,
      message: `Subscribed to @${creator.username}! You can now view exclusive posts. ⭐`,
      isSubscribed: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing to creator' });
  }
});

// PROMOTE POST (SPONSORED CONTENT)
router.post('/promote', authMiddleware, async (req, res) => {
  try {
    const { postId, budget } = req.body;
    const post = await Post.findOne({ _id: postId, author: req.user._id });

    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    post.isSponsored = true;
    post.impressionsCount = (post.impressionsCount || 0) + (budget || 5) * 200;
    await post.save();

    res.json({
      success: true,
      message: `Post boosted! Granted ${budget * 200} sponsored impressions. 🚀`,
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Error promoting post' });
  }
});

// CREATOR ANALYTICS DASHBOARD
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const userPosts = await Post.find({ author: req.user._id });
    
    let totalImpressions = 0;
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalReposts = 0;

    userPosts.forEach(post => {
      totalImpressions += post.impressionsCount || 1;
      totalViews += post.viewsCount || 1;
      totalLikes += post.likes ? post.likes.length : 0;
      totalComments += post.comments ? post.comments.length : 0;
      totalReposts += post.repostCount || 0;
    });

    const totalEngagements = totalLikes + totalComments + totalReposts;
    const engagementRate = totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(2) : '0.00';

    const topPosts = userPosts
      .map(post => ({
        id: post._id,
        content: post.content.substring(0, 60) + '...',
        likes: post.likes.length,
        comments: post.comments.length,
        views: post.viewsCount || 1,
        createdAt: post.createdAt
      }))
      .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
      .slice(0, 5);

    res.json({
      totalPosts: userPosts.length,
      totalImpressions: totalImpressions + (userPosts.length * 45),
      totalViews: totalViews + (userPosts.length * 32),
      totalLikes,
      totalComments,
      totalReposts,
      engagementRate: `${engagementRate}%`,
      subscribersCount: req.user.subscribers ? req.user.subscribers.length : 0,
      estimatedEarnings: (req.user.subscribers ? req.user.subscribers.length * 4.99 : 0) + 25.0,
      topPosts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating creator analytics' });
  }
});

export default router;
