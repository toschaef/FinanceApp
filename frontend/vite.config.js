import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const isProd = process.env.VITE_NODE_ENV === 'production'
const useDocker = process.env.VITE_USE_DOCKER === 'true'

export default defineConfig(({ command }) => {
  return {
    envDir: '../',
    plugins: [react()],
    server: command === 'serve' ? {
      host: '0.0.0.0',
      port: 3000,
      https: isProd
        ? {
            key: fs.readFileSync('/app/certs/key.pem'),
            cert: fs.readFileSync('/app/certs/cert.pem'),
          }
        : undefined,
      proxy: {
        '/api': {
          target: useDocker
            ? isProd ? 'https://backend:443' : 'http://backend:5000'
            : isProd ? 'https://localhost:443' : 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    } : undefined,
  }
})