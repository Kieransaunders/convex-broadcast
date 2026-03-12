import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig, loadEnv } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env vars from .env.local
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    server: {
      port: 3000,
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tanstackStart(),
      viteReact(),
    ],
    define: {
      'process.env.CONVEX_URL': JSON.stringify(env.CONVEX_URL ?? env.VITE_CONVEX_URL),
      'process.env.CONVEX_SITE_URL': JSON.stringify(env.CONVEX_SITE_URL ?? env.VITE_CONVEX_SITE_URL),
      'process.env.VITE_CONVEX_URL': JSON.stringify(env.VITE_CONVEX_URL),
      'process.env.VITE_CONVEX_SITE_URL': JSON.stringify(env.VITE_CONVEX_SITE_URL),
    },
  }
})
