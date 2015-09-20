// modified from https://github.com/ooflorent/js13k-boilerplate/blob/master/gulpfile.js
var program = require('commander');
var browserify = require('browserify');
var express = require('express');
var path = require('path');
var map = require('vinyl-map');
var rimraf = require('rimraf');
var envify = require('envify/custom');
var CleanCSS = require('clean-css');

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var buffer = require('gulp-buffer');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var micro = require('gulp-micro');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var source = require('vinyl-source-stream');

program.on('--help', function(){
  console.log('  Tasks:');
  console.log();
  console.log('    build       build the game');
  console.log('    clean       delete generated files');
  console.log('    dist        generate archive');
  console.log('    serve       launch development server');
  console.log('    watch       watch for file changes and rebuild automatically');
  console.log();
});

program
  .usage('<task> [options]')
  .option('-P, --prod', 'generate production assets')
  .parse(process.argv);

var prod = !!program.prod;

gulp.task('default', ['build']);
gulp.task('build', ['build_source', 'build_html', 'build_styles']);

gulp.task('build_source', function() {
  // TODO: Use envify here
  var bundler = browserify('./src/js/main.js', {debug: !prod});
  if (prod) {
    bundler.plugin(require('bundle-collapser/plugin'));
  }

  bundler.transform(envify({
    _: 'purge'
  , NODE_ENV: prod ? 'production' : process.env.NODE_ENV
  }))

  return bundler
    .bundle()
    .on('error', browserifyError)
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe(gulpif(prod, uglify()))
    .pipe(gulp.dest('build'));
});

gulp.task('build_html', function() {
  return gulp.src('src/*.html')
    .pipe(gulpif(prod, htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
    })))
    .pipe(gulp.dest('build'));
});

gulp.task('build_styles', function minifyCSSTask() {
  // this snippet basically replaces `gulp-minify-css`
  var minify = map(function (buff, filename) {
    return new CleanCSS({
      // specify your clean-css options here
    }).minify(buff.toString()).styles;
  });

  return gulp.src('src/css/**/*.css')
    .pipe(concat('build.css'))
    .pipe(gulpif(prod, minify))
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  rimraf.sync('build');
  rimraf.sync('dist');
});

gulp.task('dist', ['build'], function() {
  if (!prod) {
    gutil.log(gutil.colors.yellow('WARNING'), gutil.colors.gray('Missing flag --prod'));
    gutil.log(gutil.colors.yellow('WARNING'), gutil.colors.gray('You should generate production assets to lower the archive size'));
  }

  return gulp.src('build/*')
    .pipe(zip('archive.zip'))
    .pipe(size())
    .pipe(micro({limit: 13 * 1024}))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js', ['build_source']);
  gulp.watch('src/css/**/*.css', ['build_styles']);
  gulp.watch('src/*.html', ['build_html']);
});

gulp.task('serve', ['build'], function() {
  var htdocs = path.resolve(__dirname, 'build');
  var app = express();

  app.use(express.static(htdocs));
  app.listen(3000, function() {
    gutil.log("Server started on '" + gutil.colors.green('http://localhost:3000') + "'");
  });
});

function browserifyError(err) {
  gutil.log(gutil.colors.red('ERROR'), gutil.colors.gray(err.message));
  this.emit('end');
}
