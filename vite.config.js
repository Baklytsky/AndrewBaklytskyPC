import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import vue from '@vitejs/plugin-vue'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import pageReload from 'vite-plugin-page-reload'
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer'
import css from 'rollup-plugin-css-only'
import path from "path";

export default defineConfig({
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
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
    css({ output: 'main.min.css' }),
    vue(),
  ],
  resolve: {
    alias: {
      '@bva': path.resolve(__dirname, '@bva')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    plugins: [
      autoprefixer(),
    ],
  },
  build: {
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].min.js',
        chunkFileNames: '[name].min.js',
        assetFileNames: '[name].min.[ext]',
      },
    },
  },
})