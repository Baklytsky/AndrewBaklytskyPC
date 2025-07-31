const path = require('path');

const yargs = require('yargs');
const argv = require('yargs').argv;
const log = require('fancy-log');
const colors = require('ansi-colors');

const isProduction = process.env.NODE_ENV === 'production';
let pkg = {};
let env = 'development';
let stripTestIds = isProduction;

const {env: envs = 'development', _: rest} = yargs(process.argv.slice(3)).parserConfiguration({'unknown-options-as-args': true}).string('env').alias('e', 'env').argv;

if (envs !== 'undefined') {
  log(`Using environment(s): ${envs}`);
}

if ('stripTestIds' in argv) {
  stripTestIds = argv.stripTestIds !== 'false';

  if (stripTestIds) {
    log(colors.red(`️Stripping test ids`));
  }
}

try {
  pkg = require(path.join(__dirname, '..', 'package.json'));
} catch (err) {
  log(colors.red(err));
}

module.exports = {
  packageJson: pkg,
  tkConfig: 'config.yml',
  stripTestIds,

  src: {
    root: 'src',
    json: 'src/**/*.json',
    js: 'src/**/*.{js,js.liquid}',
    css: 'src/**/*.{css,scss,css.liquid,scss.liquid}',
    liquidTemplates: 'src/**/*.liquid',
    jsTemplates: 'src/**/*.js.liquid',
    cssTheme: 'src/css/theme.scss',
    cssComponents: 'src/css/components/*.{css,scss}',
    cssTemplates: 'src/**/*.{css,scss}.liquid',
    svgTemplates: 'src/**/*.svg.liquid',
    assets: 'src/assets/**/*',
    nonLiquidAssets: 'src/assets/**/!(*.liquid)',
    icons: 'src/icons/**/*.svg',
    templates: 'src/templates/**/*.{liquid,json}',
    snippets: 'src/snippets/**/*.{liquid,json}',
    blocks: 'src/blocks/**/*.{liquid,json}',
    sections: 'src/sections/**/*.{liquid,json}',
    locales: 'src/locales/*',
    config: 'src/config/*',
    layout: 'src/layout/*',
    notes: 'src/release-notes.md',
    shopifyIgnore: 'src/.shopifyignore',
  },

  dist: {
    root: 'dist',
    assets: 'dist/assets',
    snippets: 'dist/snippets',
    render: 'dist/render',
    blocks: 'dist/blocks',
    sections: 'dist/sections',
    layout: 'dist/layout',
    templates: 'dist/templates',
    locales: 'dist/locales',
    content: 'dist/content',
  },

  upload: {
    root: 'upload/',
  },

  plugins: {
    cheerio: {
      run: require('./build/utilities.js').processSvg,
    },
    svgmin: {
      plugins: ['removeTitle', 'removeDesc', {removeViewBox: false}],
    },
  },
};
