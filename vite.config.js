import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import vue from '@vitejs/plugin-vue'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import pageReload from 'vite-plugin-page-reload'
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    vue(),
    cleanup(),
    shopify({
      // Root path to your Shopify theme directory (location of snippets, sections, templates, etc.)
      themeRoot: './',
      // Front-end source code directory
      sourceCodeDir: 'src',
      // Front-end entry points directory
      entrypointsDir: 'src/entrypoints',
      // Additional files to use as entry points (accepts an array of file paths or glob patterns)
      additionalEntrypoints: [
        'src/scss/inline/*.scss',
        'src/scss/sections/*.scss',
        'src/js/sections/*.js',
      ],
      // Specifies the file name of the snippet that loads your assets
      snippetFile: 'vite-tag.liquid',
      // Specifies whether to append version numbers to your production-ready asset URLs in `snippetFile`
      versionNumbers: false,
      // Enables the creation of Cloudflare tunnels during dev, allowing previews from any device
      tunnel: false
    }),
    pageReload('/tmp/theme.update', {
      delay: 2000
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      },
    },
    plugins: [
      tailwindcss(),
      autoprefixer(),
    ],
  },
  build: {
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].min.js',
        chunkFileNames: '[name].[hash].min.js',
        assetFileNames: '[name].[hash].min.[ext]',
      },
    },
  },
})