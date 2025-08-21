import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateText } from './ai.js';


// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Must come before Socket.IO initialization
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io/',
  serveClient: false,
  pingTimeout: 60000
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});




// Track users in each room
const roomUsers = new Map();

// === AI API Endpoint ===

app.post('/api/ai/text', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  try {
    const text = await generateText(prompt);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err?.toString?.() || 'AI error' });
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  let currentRoom = null;
  let currentUsername = null;

  // Handle joining a room
  socket.on('joinRoom', ({ roomId, username }, callback) => {
    console.log(`${socket.id} attempting to join room:`, roomId, 'as', username);
    
    // Initialize room if it doesn't exist
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    
    const usersInRoom = roomUsers.get(roomId);
    const usernameLower = username.toLowerCase();
    
    // Check if this is a new connection (not a reconnection)
    const isNewConnection = !currentUsername;
    

    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      const previousUsers = roomUsers.get(currentRoom);
      if (previousUsers) {
        previousUsers.delete(currentUsername);
        if (previousUsers.size === 0) {
          roomUsers.delete(currentRoom);
        }
      }
    }

    // Join new room
    socket.join(roomId);
    currentRoom = roomId;
    currentUsername = username;
    
    // Add user to room
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(username);
    
    console.log(`${username} joined room: ${roomId}`);
    
    // Notify room
    io.to(roomId).emit('message', {
      user: 'system',
      text: `${username} has joined the room.`,
      timestamp: new Date().toISOString()
    });
    
    if (typeof callback === 'function') {
      callback({ status: 'ok' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id, 'from room:', currentRoom);
    if (currentRoom && currentUsername) {
      const usersInRoom = roomUsers.get(currentRoom);
      if (usersInRoom) {
        usersInRoom.delete(currentUsername);
        if (usersInRoom.size === 0) {
          roomUsers.delete(currentRoom);
        }
      }
      
      // Notify room that user left
      io.to(currentRoom).emit('message', {
        user: 'system',
        text: `${currentUsername} has left the room.`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle sending messages
  socket.on('sendMessage', (data, callback) => {
    console.log('Message received from client:', data);
    
    if (!data.roomId) {
      console.error('No roomId provided in message');
      if (typeof callback === 'function') {
        callback({ status: 'error', error: 'Room ID is required' });
      }
      return;
    }
    
    if (!data.user || !data.text) {
      console.error('Invalid message format:', data);
      if (typeof callback === 'function') {
        callback({ status: 'error', error: 'Invalid message format' });
      }
      return;
    }
    
    const message = {
      user: data.user,
      text: data.text,
      roomId: data.roomId,
      timestamp: new Date().toISOString(),
      tempId: data.tempId // Echo tempId for optimistic UI update
    };
    
    console.log(`Broadcasting message to room ${data.roomId}:`, message);
    
    // Broadcast to the room
    io.to(data.roomId).emit('message', message);
    
    // Send acknowledgment back to sender
    if (typeof callback === 'function') {
      callback({ status: 'ok' });
    }
    
    console.log(`Message from ${data.user} broadcasted to room ${data.roomId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`\n=== Server running on http://localhost:${PORT} ===\n`);
});
