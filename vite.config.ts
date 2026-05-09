import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 16063,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
