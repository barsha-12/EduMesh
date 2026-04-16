import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'EduMesh V2',
        short_name: 'EduMesh',
        description: 'AI-Powered Study Platform',
        theme_color: '#F29BB2', // v-primary Soft Rose
        background_color: '#FFFDF8', // v-bg Cream
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3001,
    host: '0.0.0.0',
    // Using Vercel Serverless locally via Vercel CLI ideally, but here's the proxy fallback
    proxy: {
      '/api': {
        target: 'http://localhost:3010', // Updated to match relocated dev-server
        changeOrigin: true,
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
