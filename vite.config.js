import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'

import mdPlugin from 'vite-plugin-markdown';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: {},
  },
  plugins: [vue(), mdPlugin({mode: 'vue'})],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})