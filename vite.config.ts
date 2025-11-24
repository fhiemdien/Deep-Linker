import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third argument '' loads all env vars regardless of prefix (needed for Vercel's API_KEY).
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Safely inject the API_KEY into the client build
      // If it doesn't exist, it defaults to an empty string.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    }
  }
})