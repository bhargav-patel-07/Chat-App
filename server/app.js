// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";
import { generateText } from "./ai.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// ✅ Global CORS middleware
app.use(cors({
  origin: "https://troom.vercel.app", // Production client
  methods: ["GET", "POST" ,"OPTIONS"],
  credentials: true
}));

// AI Text Generation Endpoint
app.post('/api/ai/text', express.json(), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const response = await generateText(prompt);
    res.json({ response });
  } catch (error) {
    console.error('AI text generation error:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// ✅ HTTP server wrapper
const httpServer = http.createServer(app);

// ✅ Socket.IO server
const io = new Server(httpServer, {
  path: "/socket.io/",            // match client
  transports: ["websocket", "polling"],
  cors: {
    origin: "https://troom.vercel.app",
    methods: ["GET", "POST","OPTIONS"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000
});

// ✅ Track users per room
const roomUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  let currentRoom = null;
  let currentUsername = null;
// Add inside io.on("connection", (socket) => { ... })

socket.on("sendMessage", (messageData, callback) => {
  const { roomId, user, text, image, timestamp } = messageData;

  if (!roomId || !user || (!text && !image)) {
    if (callback) callback({ status: 'error', error: 'Invalid message' });
    return;
  }

  io.to(roomId).emit("message", {
    user,
    text,
    image,
    timestamp: timestamp || new Date().toISOString()
  });

  if (callback) callback({ status: 'ok' });
});

  // Join room
  socket.on("joinRoom", ({ username, room }) => {
    currentRoom = room;
    currentUsername = username;

    socket.join(room);

    if (!roomUsers.has(room)) {
      roomUsers.set(room, new Set());
    }
    roomUsers.get(room).add(username);

    console.log(`${username} joined room: ${room}`);

    // Notify user
    socket.emit("roomJoined", room);

    // Join room without broadcasting a system message
  });

  // Chat messages
  socket.on("chatMessage", ({ room, message }) => {
    if (!room || !currentUsername) return;

    console.log(`Message in room ${room} from ${currentUsername}: ${message}`);

    io.to(room).emit("message", {
      user: currentUsername,
      text: message,
      timestamp: new Date().toISOString()
    });
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id, "from room:", currentRoom);

    if (currentRoom && currentUsername) {
      const usersInRoom = roomUsers.get(currentRoom);
      if (usersInRoom) {
        usersInRoom.delete(currentUsername);
        if (usersInRoom.size === 0) {
          roomUsers.delete(currentRoom);
        }
      }

      io.to(currentRoom).emit("message", {
        user: "system",
        text: `${currentUsername} has left the room.`,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// ✅ AI API endpoint
app.post("/api/ai", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: query }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "AI API request failed" });
    }

    // send consistent response
    res.json({
      response: data.choices[0]?.message?.content || "No response from AI"
    });
  } catch (error) {
    console.error("AI API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Socket.IO server is running");
});

// ✅ Start server
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

