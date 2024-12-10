import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import pageReload from 'vite-plugin-page-reload'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    shopify({ versionNumbers: true }),
    vue(),
    pageReload('/tmp/theme.update')
  ],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].min.js',
        chunkFileNames: '[name].min.[ext]',
        assetFileNames: '[name].min.[ext]',
      },
    },
  }
})
