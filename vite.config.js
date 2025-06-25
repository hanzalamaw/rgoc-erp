import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pure-adventure-production.up.railway.app',
        changeOrigin: true,
        secure: false,
        // If your backend expects "/login" instead of "/api/login", uncomment below:
        // rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
