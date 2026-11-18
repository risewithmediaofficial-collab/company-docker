import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const backendTarget = process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:5001'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: parseInt(process.env.PORT, 10) || 5175,
    strictPort: false,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/socket.io': {
        target: backendTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          reactCore: ['react', 'react-dom', 'react-router-dom', 'react-redux'],
          appState: ['@reduxjs/toolkit', '@tanstack/react-query'],
          dataViz: ['recharts'],
          formUi: ['react-hook-form', '@hookform/resolvers', 'zod'],
          pdf: ['jspdf', 'html2canvas'],
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', 'sonner'],
        },
      },
    },
  },
})
