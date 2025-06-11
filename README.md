# Carbon theme

### [🏷️ Releases](https://github.com/presidiocreative/carbon/releases)&nbsp;&nbsp;&nbsp;⎯⎯&nbsp;&nbsp;&nbsp;[💬 Discussions](https://github.com/presidiocreative/carbon/issues)

[vite-plugin-shopify](https://shopify-vite.barrelny.com/) aims to integrate Vite as seamlessly as possible with Shopify themes to optimize your theme development experience.
[npm documentation](https://www.npmjs.com/package/vite-plugin-shopify)


## Features

#### Clone the repo:
SSH
```
git clone git@github.com:presidiocreative/carbon.git
```

HTTPS
```
git clone https://github.com/presidiocreative/carbon.git
```

#### Check your Node version
⚠️ The recommended version is Node v20.9.x
- ⚡️ [Everything Vite provides](https://vitejs.dev/guide/features.html), plus:
- 🤖 Automatic entrypoint detection
- 🏷 Smart tag generation to load your scripts and styles
- 🌎 Full support for assets served from Shopify's CDN
- 👌 Zero-Config
- 🔩 Extensible

## Tech Stack

- [Liquid](https://shopify.dev/api/liquid) / HTML
- [SCSS](https://sass-lang.com/documentation)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [NPM](https://www.npmjs.com/)


## Install

### System Dependencies

Ensure the following is installed on your machine (click the links to find install instructions).

- [NVM](https://github.com/nvm-sh/nvm) (recommended)
- [Node](https://nodejs.org/en/download/package-manager/) (v22 +)
- [NPM](https://docs.npmjs.com/about-npm)
- [Shopify CLI (3.x)](https://shopify.dev/themes/tools/cli/install) (3.x)

### Setup
#### NVM,NODE,NPM

The project contains the `.nvmrc` file. If you have  [NVM](https://github.com/nvm-sh/nvm) installed, run the command to select the recommended version automatically:

```bash
nvm use
```

If the recommended node version is not installed, run:

```bash
nvm install 22
```
or use the [link](https://nodejs.org/uk/download) with installation instructions

#### Shopify CLI

Make sure you have the Shopify CLI globally installed. To install, you can follow the instructions from the [link](https://shopify.dev/themes/tools/cli/install)

Create a `shopify.theme.html` ([Documentation](https://shopify.dev/docs/themes/tools/cli/environments)) file with the following content:
```toml
[environments.production]
theme = 000000000
store = "store.myshopify.com"
password  = "shptka_0000"
#ignore = [
#  "config/settings_data.json",
#  "sections/*.json",
#  "templates/*.json",
#  "templates/*.*.json",
#  "templates/customers/.*.json"
#]
#live = true
#allow-live = true
```

## Usage

### Commands

- `npm install` - Install the necessary packages and dependencies
- `npm run build` - Project build
- `npm run dev` - Launch of development mode
- `npm run deploy` - Project deployment
- `npm run pull:settings` - Downloading project JSON settings, such as `config/*.json`, `sections/*.json`, `templates/*.json`
- `npm run pull:updates` - Download all project files from the theme
- `npm run zip` - Creates a zip of the theme in uploads folder

### Structure

`./`

- [.gitignore](./.gitignore): Config file for [gitignore](https://git-scm.com/docs/gitignore)
- [.nvmrc](./.nvmrc): Used to set the NPM version using [NVM](https://github.com/nvm-sh/nvm#nvmrc)
- [.shopifyignore](./.shopifyignore): Config for [Shopify CLI Ignores](https://shopify.dev/themes/tools/cli#excluding-files-from-shopify-cli)
- [.stylelintrc.js](./.stylelintrc.js): Config for [StyleLint](https://stylelint.io/user-guide/configure/)
- [package.json](./package.json): Project metadata & scripts and NPM package dependencies ([ref](https://docs.npmjs.com/cli/v7/configuring-npm/package-json))
- [package-lock.json](./package-lock.json): Lockfile for NPM package dependencies ([ref](https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json))
- [jsconfig.json](./jsconfig.json): Specifies the options for the features provided by the JavaScript language service [ref](https://code.visualstudio.com/docs/languages/jsconfig).
- [postcss.config.js](./postcss.config.js): PostCSS config file [ref](https://www.npmjs.com/package/postcss-load-config)
- [vite.config.js](./vite.config.js): Production config for [Vite](https://vite.dev/config/)

### Vite

The following is an explanation of the main components of vite.config.js:

```js
import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'
import pageReload from 'vite-plugin-page-reload'
import svgToLiquidPlugin from './src/plugins/svg-to-liquid'
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
    /* Vite plugin for correctly cleaning up an assets folder. (Currently not used and commented on) */
    // cleanup(),
    /* Custom plugin for compiling .svg files to .liquid and saving them to the snippets folder. */
    svgToLiquidPlugin(),
    /* Custom plugin to automatically reload the page after changing .liquid files. */
    liquidReloadPlugin(),
    /* Plugin options are not required, defaults shown */
    shopify({
      // Root path to your Shopify theme directory (location of snippets, sections, templates, etc.)
      themeRoot: './',
      // Front-end source code directory
      sourceCodeDir: 'src',
      // Front-end entry points directory
      entrypointsDir: 'src/entrypoints',
      // Additional files to use as entry points (accepts an array of file paths or glob patterns)
      additionalEntrypoints: [
        'src/css/components/*.scss',
        'src/js/components/*.js',
      ],
      // Specifies the file name of the snippet that loads your assets
      snippetFile: 'vite-tag.liquid',
      // Specifies whether to append version numbers to your production-ready asset URLs in `snippetFile`
      versionNumbers: false,
      // Enables the creation of Cloudflare tunnels during dev, allowing previews from any device
      tunnel: false
    }),
    //Automatically reload the page when watched files change during development
    pageReload('/tmp/theme.update', {
      paths: ['**/*.liquid'],
      delay: 2000
    }),
  ],
  css: {
    // Specify options to pass to CSS pre-processors
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
      // Autoprefixer pluggin
      autoprefixer(),
    ],
  },
  build: {
    //Generate production source maps.
    sourcemap: true,
    // By default, Vite will empty the outDir on build if it is inside project root. It will emit a warning if outDir is outside of root to avoid accidentally removing important files
    emptyOutDir: false,
    // Directly customize the underlying Rollup bundle.
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
```

Vite plugin for Shopify development does not require you to specify the entry points for your theme. By default, it treats JavaScript and CSS files (including preprocessed
languages such as TypeScript, JSX, TSX, and Sass) within the `src/entrypoints` folder in the root of your project as entry points for Vite.

```
/
└── src/
    └── entrypoints/
        ├── main.scss
        └── global.js
```

### Adding scripts and styles to your theme

Vite plugin for Shopify development generates a `vite-tag` snippet which includes `<script>` and `<link>` tags, and all the liquid logic needed
to load your assets.

With your Vite entry points configured, you only need to reference them with the `vite-tag` snippet that you add to the `<head>` of your theme's layout:

```liquid
{% liquid
  # Relative to entrypointsDir
  render 'vite-tag' with 'main.scss'
  render 'vite-tag' with 'global.js'
%}
```

During development, the `vite-tag` will load your assets from the Vite development server and inject the Vite client to enable Hot Module Replacement.
In build mode, the snippet will load your compiled and versioned assets, including any imported CSS, and use the `asset_url` filter to serve your assets
from the Shopify content delivery network (CDN).

#### Loading `additionalEntrypoints`

```liquid
{% liquid
  # Relative to sourceCodeDir
  render 'vite-tag' with '@/foo.js'
  render 'vite-tag' with '~/foo.scss'
%}
```

```liquid
{% liquid
  # Relative to project root
  render 'vite-tag' with '/bar.js' # leading slash is required
%}
```

#### Preloading stylesheets

You can pass the `preload_stylesheet` variable to the `vite-tag` snippet to enable the `preload` parameter of the `stylesheet_tag` filter. Use it sparingly. For example, consider preloading only render-blocking stylesheets.
[Learn more](https://shopify.dev/themes/best-practices/performance#use-resource-hints-to-preload-key-resources).

```liquid
{% render 'vite-tag' with 'main.scss', preload_stylesheet: true %}
```

### Import aliases

For convenience, `~/` and `@/` are aliased to your `src` folder, which simplifies imports:

```js
import App from '@/components/App.vue'
import '@/css/my_styles.css'
```
