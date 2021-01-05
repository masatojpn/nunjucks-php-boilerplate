'use strict';
const conf = require('./conf');

const gulp = require('gulp');
const sass = require('gulp-sass');
const gulpAutoPrefixer = require('gulp-autoprefixer');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const beautify = require('gulp-html-beautify');
const autoprefixer = require('autoprefixer');
const sassGlob = require('gulp-sass-glob');
const gulpStylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync');
const cssSort = require('css-declaration-sorter');
const watch = require('gulp-watch');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');

const paths = {
  'src' : {
    'root'       : 'src/',
    'template'   : 'src/template/',
    'html'       : 'src/template/page/',
    'json'       : './src/template/data/site.json',
    'assets'      : 'src/assets/'
  },
  'dest' : {
    'root'       : 'html/',
    'assets'     : 'html/assets/'
  }
}

const beautify_option = {
  'indent_size': 2
}

const nunjucks = (done) => {
  return gulp.src([
    paths.src.html + '**/*.njk',
    '!' + paths.src.html + '**/*_php.njk'
  ])
  .pipe(data(function(){
    return require(paths.src.json);
  }))
  .pipe(nunjucksRender({
    path: paths.src.template
  }))
  .pipe(beautify(beautify_option))
  .pipe(gulp.dest(paths.dest.root))
  done();
}

const php = (done) => {
  return gulp.src(paths.src.html + '**/*_php.njk')
  .pipe(data(function(){
    return require(paths.src.json);
  }))
  .pipe(nunjucksRender({
    path: paths.src.template
  }))
  .pipe(beautify(beautify_option))
  .pipe(rename(function(path){
    path.basename = path.basename.replace('_php', '');
    path.extname = '.php';
    console.log(path)
  }))
  .pipe(gulp.dest(paths.dest.root))
  done();
}


const js = (done) => {
  return gulp.src(`${paths.src.assets}**/!(_)*.es6`)
    .pipe(babel({
      "presets": ["@babel/preset-env"]
    }))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest(`${paths.dest.assets}`))
  done();
}

const scss = (done) => {
  return gulp.src(`${paths.src.assets}**/!(_)*.scss`)
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss([autoprefixer()]))
    .pipe(postcss([cssSort({ order: 'alphabetical' })]))
    .pipe(
      gulpStylelint({
        fix: true
      })
    )
    .pipe(gulp.dest(`${paths.dest.assets}`))
    .pipe(cleanCss())
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest(`${paths.dest.assets}`))
  done();
}

const images = (done) => {
  return gulp.src(`${paths.src.assets}**/*.{jpg,jpeg,png,gif,mp4,svg,ico}`)
    .pipe(imagemin())
    .pipe(gulp.dest(`${paths.dest.assets}`))
  done();
}

const font = (done) => {
  return gulp.src(`${paths.src.assets}**/*.{eot,woff,woff2}`)
  .pipe(gulp.dest(`${paths.dest.assets}`))
  done();
}

const serve = (done) => {
  browserSync.init({
    open: false,
    startPath: '/',
    proxy: 'localhost:8080',
    port: 3000,
    reloadDelay: 1000,
    once: true,
    notify: false,
    ghostMode: false,
  });
  done();
}

const reload = (done) => {
  browserSync.reload();
  done();
}

const filewatch = (done) => {
  gulp.watch([`${paths.src.root}**/*.scss`], gulp.series(scss, reload));
  gulp.watch([
    `${paths.src.root}**/*.njk`,
    '!' + paths.src.html + '**/*_php.njk'
  ], gulp.series(nunjucks, reload));
  gulp.watch([
    `${paths.src.root}**/*_php.njk`,
  ], gulp.series(php, reload));
  gulp.watch([`${paths.src.root}**/*.es6`], gulp.series(js, reload));
  gulp.watch([`${paths.src.root}**/*.{jpg,jpeg,png,gif,svg,ico,mp4}`], gulp.series(images, reload));
  gulp.watch([`${paths.src.root}**/*.{eot,woff,woff2}`], gulp.series(font, reload));
  done();
}

gulp.task('default', gulp.series(
  gulp.parallel(nunjucks, php, js, images, font, scss, filewatch),
  serve
));
