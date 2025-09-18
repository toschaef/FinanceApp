import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const isProd = process.env.NODE_ENV === 'production'

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
          target: isProd ? 'https://backend:443' : 'http://backend:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    } : undefined,
  }
})