import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'



const __dirname = '.'; // 或者根据实际情况设置

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  define: {
    __dirname:`'${__dirname}'`
  },
  resolve: {
    alias: {
      path: 'path-browserify'
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
