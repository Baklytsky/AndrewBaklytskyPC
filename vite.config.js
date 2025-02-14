import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import pageReload from 'vite-plugin-page-reload'
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer'
import path from 'path'
import fs from 'fs'

export default defineConfig({
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
    {
      name: 'vite-plugin-css-to-liquid',
      generateBundle(options, bundle) {
        Object.keys(bundle).forEach(fileName => {
          if (fileName.endsWith('.css') && fileName.startsWith('inline-')) {
            const source = bundle[fileName].source;
            const liquidContent = `{% style %}\n${source}\n{% endstyle %}`;
            const fileNameWithoutHash = path.basename(fileName, '.min.css').split('.')[0];
            const liquidFileName = fileNameWithoutHash + '.liquid';
            const outputDir = path.resolve(__dirname, 'snippets');
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
            fs.writeFileSync(path.join(outputDir, liquidFileName), liquidContent);
          }
        });
      },
    },
    {
      name: 'watch-additional-entrypoints',
      apply: 'serve',
      configureServer(server) {
        server.watcher.add([
          'src/scss/inline/*.scss',
          'src/scss/sections/*.scss',
          'src/js/sections/*.js',
        ]);

        server.watcher.on('change', (filePath) => {
          if (filePath.endsWith('.scss') || filePath.endsWith('.js')) {
            server.ws.send({ type: 'full-reload' });
          }
        });
      }
    }
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