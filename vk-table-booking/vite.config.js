import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Включаем HTTPS для локальной разработки
  ],
  server: {
    host: 'localhost',
    port: 5173,
    https: true, // VK требует HTTPS
    strictPort: true,
  },
  base: '/', // Базовый путь для VK Mini App
})
