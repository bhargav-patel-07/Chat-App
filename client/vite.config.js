import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
      timeout: 30000,
      overlay: false
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true
  }
})
