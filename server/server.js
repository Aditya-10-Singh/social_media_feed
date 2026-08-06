import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import trendingRoutes from './routes/trending.js';
import notificationRoutes from './routes/notifications.js';
import stripeRoutes from './routes/stripe.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable Socket.io with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend in production if built
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Pulse Social API', time: new Date() });
});

// Fallback to index.html for client-side React routing in deployment
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.json({ message: 'Pulse Social API Active. Deploy frontend or run dev server.' });
    }
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.io:', socket.id);

  socket.on('join:room', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on('typing', ({ postId, username }) => {
    socket.broadcast.emit('user:typing', { postId, username });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Smart Database Connection (MongoDB Atlas / Local, with Memory Server Fallback)
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to Production MongoDB Atlas Database');
      return;
    } catch (err) {
      console.error('⚠️ Could not connect to provided MONGODB_URI:', err.message);
    }
  }

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/pulse_db', { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to Local MongoDB Database');
  } catch (err) {
    console.log('⚠️ Local MongoDB not detected. Launching in-memory MongoDB server...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to In-Memory MongoDB Server');
    } catch (memErr) {
      console.error('Failed to initialize in-memory database:', memErr);
    }
  }
};

const startServer = (port) => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Pulse Social Server running on http://127.0.0.1:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is currently in use. Retrying on port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

const INITIAL_PORT = parseInt(process.env.PORT || '5000', 10);

connectDB().then(() => {
  startServer(INITIAL_PORT);
});


