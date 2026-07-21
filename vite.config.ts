import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    manifest: true,
    chunkSizeWarningLimit: 450,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replaceAll('\\', '/')
          if (moduleId.includes('/node_modules/@xyflow/')) return 'vendor-xyflow'
          if (
            [
              '/node_modules/react/',
              '/node_modules/react-dom/',
              '/node_modules/react-router/',
              '/node_modules/react-router-dom/',
              '/node_modules/scheduler/',
            ].some((segment) => moduleId.includes(segment))
          ) {
            return 'vendor-react'
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
      '/static': 'http://localhost:8000',
    },
  },
})
