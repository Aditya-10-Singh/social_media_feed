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
      .limit(30)
      .populate('sender', 'name username avatar')
      .populate('post', 'content');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error loading notifications' });
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
