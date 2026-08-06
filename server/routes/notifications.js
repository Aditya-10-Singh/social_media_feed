import express from 'express';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { getVapidPublicKey } from '../utils/webPush.js';

const router = express.Router();

// GET User Notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'name username avatar' }
      });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error loading notifications' });
  }
});

// GET Unread Notification Count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread notification count' });
  }
});

// MARK All Notifications as Read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications read' });
  }
});

// MARK Notification as Read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification read' });
  }
});

// GET Web Push VAPID Key
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: getVapidPublicKey() });
});

// SUBSCRIBE Push Subscription
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { subscription } = req.body;
    req.user.pushSubscription = subscription;
    await req.user.save();
    res.json({ success: true, message: 'Web Push subscription registered' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving push subscription' });
  }
});

export default router;
