import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import pageReload from 'vite-plugin-page-reload'
import { svgToLiquidPlugin } from './src/plugins/svg-to-liquid'
import liquidReloadPlugin from './src/plugins/liquid-reload'
import autoprefixer from 'autoprefixer'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    // cleanup(),
    svgToLiquidPlugin(),
    liquidReloadPlugin(),
    shopify({
      themeRoot: './',
      sourceCodeDir: 'src',
      entrypointsDir: 'src/entrypoints',
      additionalEntrypoints: [
        'src/css/components/*.scss',
        'src/js/components/*.js',
      ],
      snippetFile: 'vite-tag.liquid',
      versionNumbers: false,
      tunnel: false
    }),
    pageReload('/tmp/theme.update', {
      paths: ['**/*.liquid'],
      delay: 2000
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/css/settings/variables.scss" as *;
          @use "@/css/tools/mixins.scss" as *;
        `,
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
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})