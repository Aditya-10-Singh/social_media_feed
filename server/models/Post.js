import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String, default: '' },
  hashtags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  repostCount: { type: Number, default: 0 },
  repostedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  isQuotePost: { type: Boolean, default: false },
  quotedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  isSubscriberOnly: { type: Boolean, default: false },
  isSponsored: { type: Boolean, default: false },
  impressionsCount: { type: Number, default: 1 },
  viewsCount: { type: Number, default: 1 },
  moderation: {
    flagged: { type: Boolean, default: false },
    toxicityScore: { type: Number, default: 0 },
    reason: { type: String, default: null }
  }
}, { timestamps: true });

postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1 });

export const Post = mongoose.model('Post', postSchema);
