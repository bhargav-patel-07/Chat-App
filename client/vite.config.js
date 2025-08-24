import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_APP_SERVER_URL': JSON.stringify(process.env.VITE_APP_SERVER_URL || 'https://chat-app-server-1-d8us.onrender.com')
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173
    },
    proxy: {
      '/socket.io': {
        target: 'https://chat-app-server-1-d8us.onrender.com',
        ws: true,
        changeOrigin: true
      }
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  base: '/',
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  },
  // Production-specific settings
  ...(command === 'build' && {
    base: './', // Use relative paths for production
    define: {
      'process.env.NODE_ENV': '"production"', // Ensure production mode
      'process.env.VITE_APP_SERVER_URL': JSON.stringify('https://chat-app-server-1-d8us.onrender.com')
    }
  })
}))
