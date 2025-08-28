import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serve under /app/ so assets resolve correctly behind Nginx
export default defineConfig({
  base: '/app/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
});