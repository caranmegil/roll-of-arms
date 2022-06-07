import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'

import mdPlugin from 'vite-plugin-markdown';
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {babel} from '@rollup/plugin-babel';

// https://vitejs.dev/config/
export default defineConfig( ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log(env);
  return {
    define: {
      global: {
      },
      'process.env': env,
    },
    plugins: [
      vue(),
      babel({ exclude: 'node_modules/**', include: '**/*.js' }),
      mdPlugin.plugin({mode: [mdPlugin.Mode.VUE, mdPlugin.Mode.HTML]}),
      vueJsx(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  };
});