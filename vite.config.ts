import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: false, // Ensure CSS is bundled correctly
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single bundle for better consistency
      },
    },
  },
})
