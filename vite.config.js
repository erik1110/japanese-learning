import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the site root (e.g. a custom domain or a user/org Pages site).
// Override with the BASE_PATH env var if you need a sub-path.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
