import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Track users in each room
const roomUsers = new Map();

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
    
    // Only check for duplicates if there are users in the room
    if (usersInRoom.size > 0) {
      // Check for duplicate username (case-insensitive)
      const isDuplicate = Array.from(usersInRoom).some(
        u => u.toLowerCase() === usernameLower && u !== currentUsername
      );
      
      if (isDuplicate) {
        console.log(`Username ${username} is already taken in room ${roomId}`);
        if (typeof callback === 'function') {
          callback({
            status: 'error',
            error: 'Username is already taken in this room. Please choose another.'
          });
        }
        return;
      }
    }

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
      timestamp: new Date().toISOString()
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
