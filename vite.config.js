import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // 1. Proxy cho API thường (như bạn đã làm với Axios)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      
      // 2. 🔥 PROXY CHO SOCKET.IO 🔥
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true, // Quan trọng: Bật hỗ trợ WebSocket
      }
    }
  }
})
