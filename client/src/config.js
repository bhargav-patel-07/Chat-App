const config = {
  // For development
  development: {
    apiUrl: 'http://localhost:5000',
    wsUrl: 'http://localhost:5000' // Local development
  },
  // For production (Render)
  production: {
    apiUrl: 'https://chat-app-1-heca.onrender.com',
    wsUrl: 'wss://chat-app-1-heca.onrender.com' // WebSocket URL for Render
  }
};

// Use Vite's import.meta.env.MODE to determine environment
const env = import.meta.env.MODE || 'development';

export default config[env];
