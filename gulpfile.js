const fs = require('fs');
const path = require('path');
const plumber = require('gulp-plumber');
const svgmin = require('gulp-svgmin');
const rename = require('gulp-rename');
const cheerio = require('gulp-cheerio');
const del = require('del');
const gulpZip = require('gulp-zip');
const cssimport = require('gulp-cssimport');
const size = require('gulp-size');
const postcss = require('gulp-postcss');
const {series, parallel, dest, src, watch} = require('gulp');
const rollup = require('rollup');
const log = require('fancy-log');
const colors = require('ansi-colors');
const loadConfigFile = require('rollup/loadConfigFile');
const gulpIf = require('gulp-if');
const autoprefixer = require('autoprefixer');
const newer = require('gulp-newer');
const dependents = require('gulp-dependents');

// Using sass-embedded
const sass = require('gulp-sass')(require('sass-embedded'));

const config = require('./lib/config');
const {startShopifyDevProcesses, deployShopifyStores} = require('./lib/build/shopify.js');
const {renderDevelopmentLiquid} = require('./lib/build/liquid.js');
const {stripDataTestId} = require('./lib/build/html.js');

const configPath = path.join(__dirname, 'rollup.config.js');
const isProduction = process.env.NODE_ENV === 'production';

// Store cache for Rollup
let rollupCache = {};

// Sass settings
const sassOptions = {
  outputStyle: isProduction ? 'compressed' : 'expanded',
  includePaths: ['src/css'],
};

// Dependents settings for tracking SCSS dependencies
const dependentsOptions = {
  '.scss': {
    parserSteps: [
      // Match all @use and @import
      /(?:@(?:use|import)\s+['"]([^'"]+)['"]);/g,
      // Get only file system path part
      function (match) {
        return match[1];
      },
    ],
    // Add .scss extension if it's missing
    postfixes: ['.scss', '/_index.scss', '/index.scss', ''],
  },
};

// Creates directories recursively if they don't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
  }
}

// Recursively copies files from source to target directory
function copyFilesRecursively(sourceDir, targetDir, filter = () => true) {
  // Make sure target directory exists
  ensureDirectoryExists(targetDir);

  // Get all items in the source directory
  const items = fs.readdirSync(sourceDir, {withFileTypes: true});

  // Process each item (file or directory)
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item.name);
    const targetPath = path.join(targetDir, item.name);

    if (item.isDirectory()) {
      // If it's a directory, recurse into it
      copyFilesRecursively(sourcePath, targetPath, filter);
    } else if (filter(sourcePath, item.name)) {
      // If it's a file and passes the filter, copy it directly
      // First ensure the target directory exists (for nested files)
      ensureDirectoryExists(path.dirname(targetPath));

      // Direct binary copy of the file using Node.js fs module
      fs.copyFileSync(sourcePath, targetPath);
      log(colors.blueBright(`Copied: ${path.relative('src', sourcePath)}`));
    }
  }
}

/*
Command functions
*/

// Compile and output assets to dist folder
function compileAssets() {
  log(colors.white('Compiling assets'));

  // Copy assets directory without any transformations
  // This ensures binary files like fonts remain intact
  copyFilesRecursively(path.join('src', 'assets'), path.join(config.dist.root, 'assets'));

  // Render files in "official" shopify folders with liquid and then copy to their respective folders in dist/
  src([config.src.snippets, config.src.blocks, config.src.sections, config.src.templates, config.src.locales, config.src.config, config.src.layout], {
    base: config.src.root,
    allowEmpty: true,
  })
    .pipe(plumber(handleError))
    .pipe(newer(config.dist.root))
    .pipe(size({showFiles: true, pretty: true}))
    .pipe(renderDevelopmentLiquid())
    .pipe(
      rename((path) => {
        // Check for any files like ".json.liquid" and rename to just ".json"
        if (path.extname === '.liquid' && path.basename.includes('.')) {
          path.extname = '';
        }
      })
    )
    .pipe(gulpIf(config.stripTestIds, stripDataTestId()))
    .pipe(dest(config.dist.root));

  // Render all other assets liquid then copy to to assets/
  return src([config.src.cssTemplates, config.src.jsTemplates, config.src.svgTemplates], {base: config.src.root, allowEmpty: true})
    .pipe(plumber(handleError))
    .pipe(newer(config.dist.assets))
    .pipe(size({showFiles: true, pretty: true}))
    .pipe(
      rename({
        dirname: '',
      })
    )
    .pipe(renderDevelopmentLiquid())
    .pipe(dest(config.dist.assets));
}

// Minify SVGs, replace .liquid extension, and output to dist/snippets
function compileIcons() {
  const iconDirectory = path.join(__dirname, 'src/icons');

  if (!fs.existsSync(iconDirectory)) {
    log(colors.yellow('Skipping SVG compilation: src/icons not found'));
    return Promise.resolve();
  }

  log(colors.white('Processing SVGs'));

  return src(config.src.icons, {allowEmpty: true})
    .pipe(
      newer({
        dest: config.dist.snippets,
        ext: '.liquid',
      })
    )
    .pipe(svgmin(config.plugins.svgmin))
    .pipe(cheerio(config.plugins.cheerio))
    .pipe(
      size({
        showFiles: true,
        pretty: true,
      })
    )
    .pipe(
      rename({
        extname: '.liquid',
      })
    )
    .pipe(plumber(handleError))
    .pipe(dest(config.dist.snippets));
}

// Compile JS assets using rollup and output to dist
function compileJS() {
  log(colors.white('Compiling JS'));

  return loadConfigFile(configPath)
    .then(async ({options, warnings}) => {
      log(colors.cyan('Rollup 🍣'), 'Loaded', colors.white('config loaded'), 'from', colors.white(configPath));

      log(`We currently have ${warnings.count} warnings`);
      warnings.flush();

      for (const optionsObj of options) {
        optionsObj.cache = rollupCache[optionsObj.input];
        const bundle = await rollup.rollup(optionsObj);
        rollupCache[optionsObj.input] = bundle.cache;
        await Promise.all(optionsObj.output.map(bundle.write));
      }
    })
    .catch(handleError);
}

// Process CSS with sass-embedded and copy to dist/assets
function compileCss() {
  log(colors.white('Compiling CSS with sass-embedded'));

  const startTime = Date.now();

  return src([config.src.cssTheme, config.src.cssComponents], {
    allowEmpty: true,
  })
    .pipe(plumber(handleError))
    .pipe(newer(config.dist.assets))
    .pipe(dependents(dependentsOptions))
    .pipe(
      cssimport({
        extensions: ['scss'],
      })
    )
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss([autoprefixer]))
    .pipe(
      rename((path) => ({
        ...path,
        dirname: '/',
      }))
    )
    .pipe(dest(config.dist.assets))
    .on('end', function () {
      const endTime = Date.now();
      log(colors.green(`CSS compilation completed in ${(endTime - startTime) / 1000} seconds`));
    });
}

// Zip theme and output to dist
function zip() {
  return src(path.join(config.dist.root, '**', '*'))
    .pipe(plumber(handleError))
    .pipe(gulpZip(`${config.packageJson.name}-${config.packageJson.version}.zip` || 'theme.zip'))
    .pipe(size({showFiles: true, pretty: true}))
    .pipe(dest(config.upload.root));
}

// Delete config.yml from dist, very important that this does not end up in the theme store!!!
function cleanConfig() {
  return del(path.join(config.dist.root, config.tkConfig));
}

// Clean dist folder
function cleanAll() {
  rollupCache = {};
  return del(path.join(config.dist.root, '**/*'));
}

const buildAll = parallel(compileCss, compileJS, compileAssets, compileIcons);

// Watch all theme assets and rebuild when changed
async function watchAll(done) {
  // Rebuild JS and hot reload when JS changes
  watch(config.src.js, compileJS);

  // Watch all SCSS files (entry points, components, and dependencies)
  watch(['src/css/**/*.scss'], compileCss);

  // Compile assets (.liquid files, etc) when they change
  watch(path.join('environments', '**', '*.json'), series(compileAssets));
  watch(path.join('src', '**', '!(*.{js,scss,css})'), compileAssets);

  // Process SVGs when they change
  watch(config.src.icons, compileIcons);

  log(colors.green('Watching for changes...'));
  done();
}

/*
Command configuration
*/

exports.compileCss = series(compileCss);
exports.compileAssets = series(compileAssets);
exports.watch = series(cleanAll, buildAll, parallel(watchAll, startShopifyDevProcesses));
exports.deploy = series(cleanAll, buildAll, deployShopifyStores);
exports.build = series(cleanAll, buildAll);
exports.zip = series(cleanAll, buildAll, cleanConfig /* <- VERY IMPORTANT, DO NOT REMOVE */, zip);
exports.default = series(cleanAll, buildAll);

function handleError(err) {
  log(colors.red(err));
  this.emit('end'); // Continue gulp execution after error
}
