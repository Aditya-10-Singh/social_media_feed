import express from 'express';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkContentSafety } from '../utils/aiModerator.js';
import { redisClient } from '../utils/redis.js';
import { sendPushNotification } from '../utils/webPush.js';

const router = express.Router();

// Helper to extract #hashtags
const extractHashtags = (text) => {
  const matches = text.match(/#[\w]+/g);
  return matches ? matches.map(t => t.toLowerCase()) : [];
};

// GET Feed Posts (Cursor-based Pagination)
router.get('/', async (req, res) => {
  try {
    const { cursor, limit = 10, feedType = 'forYou', userId, tag } = req.query;
    const limitNum = parseInt(limit, 10);
    const query = {};

    if (cursor) {
      query._id = { $lt: cursor };
    }

    if (tag) {
      query.hashtags = `#${tag.toLowerCase().replace('#', '')}`;
    } else if (userId) {
      query.author = userId;
    } else if (feedType === 'following' && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pulse_super_secret_jwt_key_2026_purple_pink');
        const currentUser = await User.findById(decoded.userId);
        if (currentUser) {
          query.author = { $in: [...currentUser.following, currentUser._id] };
        }
      } catch (e) {
        // Fallback to global for you
      }
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum + 1)
      .populate('author', 'name username avatar isCreator bio')
      .populate({
        path: 'quotedPost',
        populate: { path: 'author', select: 'name username avatar' }
      })
      .populate('comments.user', 'name username avatar');

    let nextCursor = null;
    if (posts.length > limitNum) {
      const nextItem = posts.pop();
      nextCursor = nextItem._id;
    }

    res.json({
      posts,
      nextCursor
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// GET Bookmarks
router.get('/bookmarks', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: [
        { path: 'author', select: 'name username avatar' },
        { path: 'comments.user', select: 'name username avatar' }
      ]
    });

    res.json(user.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookmarks' });
  }
});

// GET Single Post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatar bio isCreator')
      .populate('comments.user', 'name username avatar')
      .populate({
        path: 'quotedPost',
        populate: { path: 'author', select: 'name username avatar' }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view counter
    post.viewsCount = (post.viewsCount || 0) + 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post details' });
  }
});

// CREATE Post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, mediaUrl, isQuotePost, quotedPostId, isSubscriberOnly, isSponsored } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    // AI Safety & Content Moderation Check
    const moderation = checkContentSafety(content);
    if (moderation.flagged && moderation.toxicityScore >= 0.8) {
      return res.status(422).json({
        message: 'Post rejected by AI moderation safety policy.',
        reason: moderation.reason,
        moderation
      });
    }

    const hashtags = extractHashtags(content);

    // Track hashtags in Redis
    for (const tag of hashtags) {
      await redisClient.incrementHashtag(tag);
    }

    const post = new Post({
      author: req.user._id,
      content,
      mediaUrl: mediaUrl || '',
      hashtags,
      isQuotePost: !!isQuotePost,
      quotedPost: quotedPostId || null,
      isSubscriberOnly: !!isSubscriberOnly,
      isSponsored: !!isSponsored,
      moderation
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar isCreator')
      .populate({
        path: 'quotedPost',
        populate: { path: 'author', select: 'name username avatar' }
      });

    // Emit Socket Event to all connected clients
    const io = req.app.get('socketio');
    if (io) {
      io.emit('post:created', populatedPost);
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// LIKE / UNLIKE Post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const hasLiked = post.likes.some(id => id.toString() === userIdStr);

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userIdStr);
    } else {
      post.likes.push(req.user._id);

      // Create notification if not liking own post
      if (post.author.toString() !== userIdStr) {
        const notif = new Notification({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });
        await notif.save();

        const populatedNotif = await Notification.findById(notif._id).populate('sender', 'name username avatar');

        const io = req.app.get('socketio');
        if (io) {
          io.to(`user:${post.author.toString()}`).emit('notification:new', populatedNotif);
        }

        // Web Push notification
        const targetUser = await User.findById(post.author);
        if (targetUser && targetUser.pushSubscription) {
          sendPushNotification(targetUser.pushSubscription, {
            title: 'New Like on Pulse! ❤️',
            body: `${req.user.name} (@${req.user.username}) liked your post!`,
            url: `/post/${post._id}`
          });
        }
      }
    }

    await post.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('post:updated', { postId: post._id, likesCount: post.likes.length, likes: post.likes });
    }

    res.json({ likesCount: post.likes.length, hasLiked: !hasLiked, likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error processing post like' });
  }
});

// ADD COMMENT
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name username avatar')
      .populate('comments.user', 'name username avatar');

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    // Notification
    if (post.author.toString() !== req.user._id.toString()) {
      const notif = new Notification({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id
      });
      await notif.save();

      const populatedNotif = await Notification.findById(notif._id).populate('sender', 'name username avatar');
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user:${post.author.toString()}`).emit('notification:new', populatedNotif);
      }
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('post:updated', { postId: post._id, commentsCount: post.comments.length, comments: updatedPost.comments });
    }

    res.status(201).json(addedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// REPOST / QUOTE
router.post('/:id/repost', authMiddleware, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) {
      return res.status(404).json({ message: 'Original post not found' });
    }

    originalPost.repostCount = (originalPost.repostCount || 0) + 1;
    await originalPost.save();

    const newPost = new Post({
      author: req.user._id,
      content: req.body.comment || `Reposted @${originalPost.author}`,
      repostedFrom: originalPost._id,
      isQuotePost: true,
      quotedPost: originalPost._id
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'name username avatar')
      .populate({
        path: 'quotedPost',
        populate: { path: 'author', select: 'name username avatar' }
      });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('post:created', populatedPost);
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error reposting content' });
  }
});

// BOOKMARK POST
router.post('/:id/bookmark', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postIdStr = req.params.id;
    const isBookmarked = user.bookmarks.some(b => b.toString() === postIdStr);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(b => b.toString() !== postIdStr);
    } else {
      user.bookmarks.push(postIdStr);
    }

    await user.save();
    res.json({ isBookmarked: !isBookmarked, bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bookmark' });
  }
});

export default router;
