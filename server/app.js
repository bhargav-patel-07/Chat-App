import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const port = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('a user connected with id:', socket.id);
    
    // Send welcome message to the newly connected client
    socket.emit('Welcome', `Welcome to the chat! Your ID: ${socket.id}`);
    
    // Broadcast to all other clients that a new user has joined
    socket.broadcast.emit('userJoined', `User ${socket.id} has joined the chat`);
    
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        // Notify all clients that a user has left
        io.emit('userLeft', `User ${socket.id} has left the chat`);
    });
});

httpServer.listen(port, () => {
    console.log(`listening on *:${port}`);
});
