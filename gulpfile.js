const conf = require('./conf');

// ------------------------------------------------------------ //
// Packages
// ------------------------------------------------------------ //
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const beautify = require('gulp-html-beautify');
const autoprefixer = require('autoprefixer');
const sassGlob = require('gulp-sass-glob');
const styleLint = require('stylelint');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync');
const cssSort = require('css-declaration-sorter');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const htmlmin = require('gulp-htmlmin');
const fs = require('fs');

const paths = {
  src: {
    root: 'src/',
    template: 'src/template/',
    html: 'src/template/page/',
    json: './src/template/data/site.json',
    assets: 'src/assets/',
  },
  dest: {
    root: 'html/',
    assets: 'html/assets/',
  },
};

const beautifyOption = {
  indent_size: 2,
  preserve_newlines: true,
  max_preserve_newlines: 1,
  wrap_line_length: 0,
};

const nunjucks = (done) => {
  return gulp
    .src([paths.src.html + '**/*.njk', '!' + paths.src.html + '**/*_php.njk'])
    .pipe(
      data(function(file) {
        const dirname = './json/';
        const files = fs.readdirSync(dirname);
        let json = {};
        files.forEach(function(filename) {
          json[filename.replace('.json', '')] = require(dirname + filename);
        });
        return {data: json};
      })
    )
    .pipe(
      nunjucksRender({
        path: paths.src.template,
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(beautify(beautifyOption))
    .pipe(gulp.dest(paths.dest.root));
  done();
};

const php = (done) => {
  return gulp
    .src(paths.src.html + '**/*_php.njk')
    .pipe(
      data(function(file) {
        const dirname = './json/';
        const files = fs.readdirSync(dirname);
        let json = {};
        files.forEach(function(filename) {
          json[filename.replace('.json', '')] = require(dirname + filename);
        });
        return {data: json};
      })
    )
    .pipe(
      nunjucksRender({
        path: paths.src.template,
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(beautify(beautifyOption))
    .pipe(
      rename(function(path) {
        path.basename = path.basename.replace('_php', '');
        path.extname = '.php';
        console.log(path);
      })
    )
    .pipe(gulp.dest(paths.dest.root));
  done();
};

const js = (done) => {
  return gulp
    .src(`${paths.src.assets}**/!(_)*.es6`)
    .pipe(plumber())
    .pipe(eslint({useEslintrc: true}))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(gulp.dest(`${paths.dest.assets}`));
  done();
};

const stylelint = (done) => {
  return gulp
    .src(`${paths.src.assets}**/*.scss`)
    .pipe(plumber())
    .pipe(postcss(styleLint()));
  done();
};

const scss = (done) => {
  return gulp
    .src(`${paths.src.assets}**/!(_)*.scss`)
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([autoprefixer()]))
    .pipe(postcss([cssSort({order: 'alphabetical'})]))
    .pipe(gulp.dest(`${paths.dest.assets}`))
    .pipe(cleanCss())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest(`${paths.dest.assets}`));
  done();
};

const images = (done) => {
  return gulp
    .src(`${paths.src.assets}**/*.{jpg,jpeg,png,gif,mp4,svg,ico}`, {
      encoding: false,
    })
    .pipe(gulp.dest(`${paths.dest.assets}`));
  done();
};

const font = (done) => {
  return gulp
    .src(`${paths.src.assets}**/*.{eot,woff,woff2}`, {encoding: false})
    .pipe(gulp.dest(`${paths.dest.assets}`));
  done();
};

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
};

const reload = (done) => {
  browserSync.reload();
  done();
};

const filewatch = (done) => {
  gulp.watch(
    [`${paths.src.root}**/*.scss`],
    gulp.series(stylelint, scss, reload)
  );
  gulp.watch(
    [`${paths.src.root}**/*.njk`, '!' + paths.src.html + '**/*_php.njk'],
    gulp.series(nunjucks, reload)
  );
  gulp.watch([`${paths.src.root}**/*_php.njk`], gulp.series(php, reload));
  gulp.watch([`${paths.src.root}**/*.es6`], gulp.series(js, reload));
  gulp.watch(
    [`${paths.src.root}**/*.{jpg,jpeg,png,gif,svg,ico,mp4}`],
    gulp.series(images, reload)
  );
  gulp.watch(
    [`${paths.src.root}**/*.{eot,woff,woff2}`],
    gulp.series(font, reload)
  );
  done();
};

gulp.task(
  'default',
  gulp.series(
    gulp.parallel(nunjucks, php, js, images, font, stylelint, scss, filewatch),
    serve
  )
);
