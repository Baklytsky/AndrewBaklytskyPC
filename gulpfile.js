const gulp = require('gulp'),
  sass = require('gulp-sass')(require('node-sass')),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  themeKit = require('@shopify/themekit'),
  uglify = require('gulp-uglify'),
  dependents = require('gulp-dependents');
wrapper = require('gulp-wrapper');


const sources = {
  scss: './src/scss/**/*.scss',
  js: './src/js/**/*.js',
  assets: './assets/',
  scssInline: {
    path: './src/scss-inline/**/*.scss',
    dest: './snippets/'
  }
}

function buildInlineCss(cb) {
  return gulp.src(sources.scssInline.path, { since: gulp.lastRun(buildInlineCss) })
    .pipe(dependents())
    .pipe(sass.sync({ outputStyle: 'extended'}).on('error', sass.logError))
    .pipe(autoprefixer({ cascade : false }))
    .pipe(cleanCSS())
    .pipe(wrapper({
      header: '<style type="text/css">',
      footer: '</style>'
    })) // wrap content in <style> tags
    .pipe(rename((path) =>  {
      path.extname = ".min.css.liquid";
      path.basename = "_" + path.basename; // add underscore to basename
      path.dirname = "";
    }))
    .pipe(gulp.dest(sources.scssInline.dest))
    .on('end', cb)
}

function buildCss(cb) {
  return gulp.src(sources.scss, { since: gulp.lastRun(buildCss) })
    .pipe(dependents())
    .pipe(sass.sync({ outputStyle: 'extended'}).on('error', sass.logError))
    .pipe(autoprefixer({ cascade : false }))
    .pipe(cleanCSS())
    .pipe(rename((path) =>  {
      path.extname = ".min.css"
      path.dirname = ""
    }))
    .pipe(gulp.dest(sources.assets))
    .on('end', cb)
}

function buildJS() {
  return gulp.src(sources.js)
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(rename((path) =>  {
      path.dirname = ""
    }))
    .pipe(gulp.dest(sources.assets));
}



async function watchAll(done) {
  gulp.watch(sources.js, buildJS);
  gulp.watch(sources.scss, buildCss);
  gulp.watch(sources.scssInline.path, buildInlineCss);

  themeKit.command('watch', {
    config: './config.yml',
    env: "development",
    allowLive: true
  })

  done();
}

async function deploy(done) {
  gulp.task(buildCss);
  gulp.task(buildInlineCss);
  gulp.task(buildJS);

  themeKit.command('deploy', {
    config: './config.yml',
    env: "development",
    allowLive: true
  })

  done()
}

exports.watch = gulp.series(watchAll);
exports.build = gulp.series(buildCss, buildInlineCss, buildJS);
exports.deploy = gulp.series(deploy);
