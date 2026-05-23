import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,   // escucha en 0.0.0.0, necesario en Docker
    proxy: {
      // Proxy activo siempre en dev: redirige /api → API en localhost:8080.
      // En Docker, VITE_API_URL apunta al host real (http://localhost:8080)
      // y el cliente hace fetch directo, por lo que este proxy no interfiere.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
