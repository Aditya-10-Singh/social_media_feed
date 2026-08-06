# ⚡ Pulse — Real-Time Social Media Platform

- 🌐 **Live Frontend (Vercel)**: [https://social-media-feed-flame.vercel.app/](https://social-media-feed-flame.vercel.app/)
- 🚀 **Live Backend (Render)**: [https://social-media-feed-n0nz.onrender.com/](https://social-media-feed-n0nz.onrender.com/)

A full-stack Twitter/X-like microblogging platform featuring real-time feed updates, infinite scroll, AI content moderation, Cloudinary media handling, Web Push notifications, creator monetization with Stripe, and an electric purple-pink glassmorphic design theme.

---

## 🌟 Key Features

- **⚡ Real-Time Feed & Comments**: Powered by Socket.io bidirectional event broadcasting.
- **🎨 Fresh Electric Theme**: Deep Violet (`#0B0716`), Electric Pink (`#FF2A85`), and Cyan accents with dark/light theme switching.
- **📜 Infinite Scroll Feed**: Cursor-based pagination with smooth animations, supporting "For You" (Ranked) & "Following" feeds.
- **🤖 AI Text Moderation**: Automated safety & toxicity classifier evaluating posts/comments before publication.
- **📈 Redis Hashtag Trends**: Real-time sorted set frequency tracker for trending topics.
- **🖼️ Media Handling**: Cloudinary SDK integration with automatic local base64 fallback.
- **🔔 Web Push Notifications**: Service Worker integration for browser push alerts (likes, comments, new followers, tips).
- **🔁 Repost & Quote Post**: Full reference chain sharing with optional commentary.
- **🔖 Bookmarks & Creator Dashboard**: Private post saving and analytics showing total reach, engagement rates, and earnings.
- **💳 Stripe Creator Monetization**: Creator tipping, monthly subscriptions for exclusive content, and sponsored post promotions.

---

## 🚀 Quick Start Instructions

This project comes with all dependencies pre-installed in the provided zip package.

### 1. Start Backend API Server
```bash
cd server
npm start
```
*Server starts on `http://localhost:5000` with automated MongoDB memory fallback.*

### 2. Start Frontend App
```bash
cd client
npm run dev
```
*App will launch at `http://localhost:5173`.*

---

## 🛠️ Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS v3, Socket.io-client, Lucide Icons, Service Worker Web Push.
- **Backend**: Node.js, Express, Socket.io Server, Mongoose, MongoMemoryServer, ioredis fallback, Cloudinary, Stripe SDK.
