import express from 'express';
import { redisClient } from '../utils/redis.js';
import { Post } from '../models/Post.js';

const router = express.Router();

// GET Trending Hashtags
router.get('/hashtags', async (req, res) => {
  try {
    let trending = await redisClient.getTrendingHashtags(10);
    
    // If Redis store has few items, aggregate from MongoDB posts
    if (trending.length < 3) {
      const dbTags = await Post.aggregate([
        { $unwind: "$hashtags" },
        { $group: { _id: "$hashtags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      trending = dbTags.map(item => ({
        tag: item._id.replace('#', '').toLowerCase(),
        count: item.count
      }));
    }

    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending topics' });
  }
});

export default router;
