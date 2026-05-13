// You Bot AI - Backend Server
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

import chatRoutes from './routes/chat.routes.js';
import modelRoutes from './routes/model.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import settingsRoutes from './routes/settings.routes.js';

import { initDatabase } from './services/database/sqlite/init.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for local development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static('../uploads'));
  app.use('/models', express.static('../models'));
  app.use('/storage', express.static('../storage'));
}

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server instance for local development
let server = null;
let wss = null;

// Initialize database and start server (local only)
async function startServer() {
  // Skip WebSocket and database init for Vercel serverless
  if (process.env.VERCEL === '1') {
    return app;
  }
  
  try {
    await initDatabase();
    console.log('📦 Database initialized');
  } catch (error) {
    console.error('Database init failed:', error);
  }

  server = app.listen(PORT, () => {
    console.log(`🚀 You Bot AI backend running on port ${PORT}`);
  });

  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('🔌 WebSocket client connected');
    
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
    });
  });

  app.locals.wss = wss;
  return server;
}

// Export for Vercel serverless
export default app;

// Start server only when run directly
if (process.env.VERCEL !== '1') {
  startServer();
}