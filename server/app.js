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

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle joining a room
  socket.on('joinRoom', ({ roomId, username }) => {
    console.log(`${socket.id} joining room:`, roomId);
    socket.join(roomId);
    io.to(roomId).emit('message', {
      user: 'system',
      text: `${username} has joined the room.`,
      timestamp: new Date().toISOString()
    });
    
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
