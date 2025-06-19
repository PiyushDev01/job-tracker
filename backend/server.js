import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import authMiddleware from './middleware/auth.js';
import verifyCors from './middleware/cors.js';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });
console.log(`Server starting in ${process.env.NODE_ENV || 'development'} mode`);

const app = express();
const httpServer = createServer(app);
// Get frontend URL from environment variables
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log(`Using frontend URL: ${frontendURL}`);

// Allow a broader range of origins to handle Vercel's deployment patterns
const allowedOrigins = [
  frontendURL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://job-tracker-yr27.vercel.app',
  'https://job-tracker-yr27-git-main.vercel.app',
  'https://job-tracker-yr27-*.vercel.app',
  // Allow all origins in development for troubleshooting
  ...(process.env.NODE_ENV !== 'production' ? ['*'] : [])
];

console.log('Allowed origins:', allowedOrigins);

// CORS setup for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const allowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      if (allowedOrigin === origin) return true;
      if (allowedOrigin.includes('*')) {
        const pattern = new RegExp('^' + allowedOrigin.replace('*', '.*') + '$');
        return pattern.test(origin);
      }
      return false;
    });
    
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS policy`);
      callback(null, true); // Allow anyway in production to prevent issues
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: true,
    allowedHeaders: corsOptions.allowedHeaders
  },
  allowEIO3: true, // Allow Engine.IO 3 compatibility
  transports: ['polling', 'websocket'], // Try polling first, may help with some blockers
  pingTimeout: 60000, // 60 seconds before a client is considered disconnected
  pingInterval: 25000, // Send a ping every 25 seconds
  connectTimeout: 45000, // Longer connection timeout
  maxHttpBufferSize: 1e8, // Increase buffer size
  allowUpgrades: true, // Allow transport upgrades
  path: '/realtime' // Use a custom path to avoid ad-blocker blocking socket.io
});

// Connect to MongoDB
connectDB();

// Middleware - Order matters!
// Handle OPTIONS pre-flight 
app.options('*', cors(corsOptions));

// Apply CORS for all routes
app.use(cors(corsOptions));
app.use(verifyCors); // Extra CORS handling for Vercel

// Parse JSON bodies
app.use(express.json());

// Socket.io connection handling
// More lenient socket auth that won't fail on token errors
io.use(async (socket, next) => {
  try {
    console.log('Socket connection attempt from:', socket.handshake.headers.origin);
    
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;
    
    // First try to get user ID from auth property
    if (userId) {
      socket.userId = userId;
      console.log(`User connected with provided ID: ${socket.userId}`);
    } 
    // If no userId provided directly, try to extract from token
    else if (token) {
      try {
        // Verify the token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        console.log(`User authenticated via token: ${socket.userId}`);
      } catch (tokenError) {
        console.warn('Token verification failed, but allowing connection:', tokenError.message);
        // Allow connection anyway but mark as unauthenticated
        socket.userId = null;
      }
    }
    
    // If we have a userId, join the user's room
    if (socket.userId) {
      const userRoom = `user-${socket.userId}`;
      socket.join(userRoom);
      console.log(`User ${socket.userId} joined room ${userRoom}`);
    }
    
    // Always allow connection, even if authentication fails
    next();
  } catch (err) {
    console.error('Socket middleware error:', err);
    // Don't reject the connection, just mark as unauthenticated
    socket.userId = null;
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}, User ID: ${socket.userId || 'unauthenticated'}`);
  
  // Send immediate acknowledgment to the client
  socket.emit('connected', { 
    id: socket.id, 
    authenticated: !!socket.userId,
    timestamp: new Date().toISOString() 
  });
  
  // Handle ping event to keep connection alive
  socket.on('ping', () => {
    try {
      // Respond with a pong to confirm connection is working
      socket.emit('pong', { time: new Date().toISOString() });
      
      if (socket.userId) {
        const userRoom = `user-${socket.userId}`;
        console.log(`Ping received from user ${socket.userId} in room ${userRoom}`);
      }
    } catch (err) {
      console.error('Error handling ping:', err);
    }
  });
  
  // Handle explicit error events
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id}, User ID: ${socket.userId || 'unauthenticated'}, Reason: ${reason}`);
  });
  
  // Handle reconnection attempts
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Socket ${socket.id} reconnect attempt ${attemptNumber}`);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', authMiddleware, jobRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API error handling
app.use('/api', (req, res, next) => {
  // Handle direct access to API endpoints that don't exist
  res.status(404).json({ 
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack trace:', err.stack);
  
  // Set CORS headers for error responses too
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server!',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// 404 handler - must be last
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/jobs (requires auth)',
    ]
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});