# Troom - Real-time Chat with AI Integration

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-010101?logo=socket.io)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46e3b7?logo=render)](https://render.com/)

A feature-rich real-time chat application with AI integration, built with modern web technologies. Experience seamless communication with the power of AI assistance.

## ✨ Features

- 🚀 **Real-time Messaging**: Instant message delivery powered by Socket.IO
- 🤖 **AI-Powered Chat**: Toggle AI mode to get intelligent responses using:
  - Llama 70B (via Together AI)
  - Google Gemini (round-robin load balancing)
- 🔒 **Secure Rooms**: Create and join private chat rooms
- 💬 **Rich Text Support**: Markdown formatting for code snippets and text styling
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Lightning Fast**: Built with Vite for optimal performance
- 🌈 **Modern UI**: Clean interface built with styled-components

## 🛠 Tech Stack

### Frontend
- React 18
- Vite
- Styled Components
- Socket.IO Client
- React Markdown

### Backend
- Node.js
- Express
- Socket.IO
- Together AI API
- Google Gemini API

### Deployment
- **Frontend**: Vercel
- **Backend**: Render

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Together AI API Key
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chat-app.git
   cd chat-app
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Configure frontend environment variables
   ```

4. **Start the development servers**
   ```bash
   # In the server directory
   npm run dev
   
   # In a new terminal, from the client directory
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=5000
TOGETHER_API_KEY=your_together_ai_api_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Frontend (`.env`)
```env
VITE_APP_SERVER_URL=http://localhost:5000
# For production: https://your-render-backend-url.onrender.com
```

## 🌐 Deployment

### Frontend (Vercel)
1. Push your code to a GitHub repository
2. Import the repository into Vercel
3. Set up environment variables in Vercel
4. Deploy!

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set up the build command: `npm install`
4. Set the start command: `node app.js`
5. Add environment variables
6. Deploy!

## 📸 Screenshots

*Screenshots will be added soon*

## 🛣 Roadmap

### Upcoming Features
- [ ] User authentication
- [ ] Message history with database integration
- [ ] Image sharing with AI captioning
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Emoji reactions
- [ ] File sharing
- [ ] Voice messages

### Known Issues
- [ ] Mobile responsiveness improvements
- [ ] Better error handling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Together AI](https://together.xyz/) for their powerful AI models
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Socket.IO](https://socket.io/) for real-time communication
- [Vite](https://vitejs.dev/) for the amazing build tooling

---

Built with ❤️ by [Your Name]
