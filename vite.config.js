import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const browserAccountMode = process.env.VERCEL === '1' || process.env.VITE_BROWSER_ACCOUNTS === 'true'

export default defineConfig({
  define: {
    'import.meta.env.VITE_BROWSER_ACCOUNTS': JSON.stringify(String(browserAccountMode)),
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        perfil: resolve(root, 'perfil.html'),
      },
    },
  },
})
