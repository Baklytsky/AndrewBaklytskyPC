import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import pageReload from 'vite-plugin-page-reload'
import autoprefixer from 'autoprefixer'
import path from 'path'
import fs from 'fs'

const copyFile = async (filePath) => {
  try {
    const fileName = path.basename(filePath, '.svg');
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const targetPath = `snippets/${fileName}.liquid`;

    await fs.promises.writeFile(targetPath, content, 'utf-8');
    console.log(`SVG plugin: Successfully copied to ${targetPath}`);

    return true;
  } catch (error) {
    console.error('SVG plugin error:', error);
    return false;
  }
};

const svgToLiquidPlugin = () => ({
  name: 'svg-to-liquid',

  async buildStart() {
    console.log('SVG plugin: Starting build process');

    try {
      const files = await fs.promises.readdir('src/icons');
      const svgFiles = files.filter(file => file.endsWith('.svg'));

      for (const file of svgFiles) {
        await copyFile(`src/icons/${file}`);
      }
    } catch (error) {
      console.error('SVG plugin build error:', error);
    }
  },

  async handleHotUpdate({ file, server }) {
    if (file.includes('src/icons') && file.endsWith('.svg')) {
      console.log(`SVG plugin: Detected change in ${file}`);

      if (await copyFile(file)) {
        server.ws.send({
          type: 'full-reload'
        });
        console.log('SVG plugin: Triggered page reload');
      }
    }
  },

  configureServer(server) {
    console.log('SVG plugin: Development server configured');
    server.watcher.on('change', (path) => {
      if (path.includes('src/icons') && path.endsWith('.svg')) {
        console.log(`SVG plugin: Watcher detected change in ${path}`);
      }
    });
  }
});


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
    cleanup(),
    svgToLiquidPlugin(),
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