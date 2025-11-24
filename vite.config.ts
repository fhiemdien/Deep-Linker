import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for process.env in browser if needed, 
    // though for Vite we usually use import.meta.env.
    // This allows existing process.env.API_KEY usage to not crash, 
    // but you should configure Vercel Environment Variables.
    'process.env': process.env
  }
})