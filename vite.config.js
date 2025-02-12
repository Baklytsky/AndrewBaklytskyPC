import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import pageReload from 'vite-plugin-page-reload'

export default defineConfig({
  plugins: [
    shopify({
      // Root path to your Shopify theme directory (location of snippets, sections, templates, etc.)
      themeRoot: './',
      // Front-end source code directory
      sourceCodeDir: 'src',
      // Front-end entry points directory
      entrypointsDir: 'src/entrypoints',
      // Additional files to use as entry points (accepts an array of file paths or glob patterns)
      additionalEntrypoints: [],
      // Specifies the file name of the snippet that loads your assets
      snippetFile: 'vite-tag.liquid',
      // Specifies whether to append version numbers to your production-ready asset URLs in `snippetFile`
      versionNumbers: false,
      // Enables the creation of Cloudflare tunnels during dev, allowing previews from any device
      tunnel: false
    }),
    pageReload('/tmp/theme.update')
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].min.js',
        chunkFileNames: '[name].min.[ext]',
        assetFileNames: '[name].min.[ext]',
      },
    },
  },
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
