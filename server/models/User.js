import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: 'Welcome to my Pulse profile! 🚀' },
  location: { type: String, default: 'Web3 / Global' },
  website: { type: String, default: '' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  isCreator: { type: Boolean, default: false },
  subscriptionPrice: { type: Number, default: 4.99 },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pushSubscription: { type: Object, default: null }
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
