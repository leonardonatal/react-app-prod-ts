import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Allows "@/components/Foo" instead of "../../components/Foo"
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Runs tests in a fake browser environment so React components can render.
    environment: 'jsdom',
    // describe/it/expect available globally without importing in every test file.
    globals: true,
    // Runs before every test file — sets up jest-dom matchers.
    setupFiles: ['./src/test/setup.ts'],
  },
})
