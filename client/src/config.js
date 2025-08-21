const config = {
  // For development
  development: {
    apiUrl: 'http://localhost:5000',
    wsUrl: 'ws://localhost:5000'
  },
  // For production (Vercel)
  production: {
    apiUrl: 'https://troom.vercel.app',
    wsUrl: 'wss://troom.vercel.app'
  }
};

// Use Vite's import.meta.env.MODE to determine environment
const env = import.meta.env.MODE || 'development';

export default config[env];
