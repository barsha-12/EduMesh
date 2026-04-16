import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// EduMesh V2 - Optimized Root Configuration
export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [
    react()
  ],
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Reduced warnings for large 3D/AI chunks
  },
});
