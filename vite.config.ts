import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env vars from .env.local
  const env = loadEnv(mode, process.cwd(), "") as Record<string, string | undefined>;

  const isNodeModule = (id: string, pkg: string) =>
    id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`);

  return {
    server: {
      port: 3000,
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tanstackStart(),
      viteReact(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Only chunk node_modules, not source files
            if (id.includes('node_modules')) {
              if (isNodeModule(id, 'react') || isNodeModule(id, 'react-dom')) {
                return 'vendor';
              }
              if (
                isNodeModule(id, '@tanstack/react-router') ||
                isNodeModule(id, '@tanstack/router-core') ||
                isNodeModule(id, '@tanstack/react-start')
              ) {
                return 'router';
              }
              if (
                isNodeModule(id, '@tanstack/react-query') ||
                isNodeModule(id, '@tanstack/query-core')
              ) {
                return 'query';
              }
              if (
                isNodeModule(id, 'convex') ||
                isNodeModule(id, '@convex-dev/better-auth') ||
                isNodeModule(id, '@convex-dev/react-query') ||
                isNodeModule(id, '@convex-dev/resend')
              ) {
                return 'convex';
              }
              if (isNodeModule(id, 'lucide-react')) return 'icons';
            }
          },
        },
      },
    },
    define: {
      "process.env.CONVEX_URL": JSON.stringify(
        env.CONVEX_URL ?? env.VITE_CONVEX_URL,
      ),
      "process.env.CONVEX_SITE_URL": JSON.stringify(
        env.CONVEX_SITE_URL ?? env.VITE_CONVEX_SITE_URL,
      ),
      "process.env.VITE_CONVEX_URL": JSON.stringify(env.VITE_CONVEX_URL),
      "process.env.VITE_CONVEX_SITE_URL": JSON.stringify(
        env.VITE_CONVEX_SITE_URL,
      ),
    },
  };
});
