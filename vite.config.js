import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'

import mdPlugin from 'vite-plugin-markdown';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig( ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env);
  return {
    define: {
     process: {
       env,
     },
    },
    plugins: [vue(), mdPlugin({mode: 'vue'})],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
});