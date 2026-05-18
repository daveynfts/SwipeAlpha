import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/agentswindler/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/nansen': {
        target: 'https://api.nansen.ai/api/v1/agent',
        changeOrigin: true,
        rewrite: (path, req) => {
          const match = req.url?.match(/modelName=([^&]+)/);
          const model = match ? match[1] : 'fast';
          return `/${model}`;
        }
      }
    }
  }
})
