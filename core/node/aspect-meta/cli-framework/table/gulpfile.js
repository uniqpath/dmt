var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var printExample = require('./lib/print-example');

gulp.task('test', mochaTask);
gulp.task('coverage', coverage());
gulp.task('coverage-api', coverage({ grep: '@api' }));

gulp.task('watch-test', function() {
  gulp.watch(['test/**', 'src/**', 'examples/**'], ['test']);
  mochaTask();
});

gulp.task('example', function() {
  printExample.logExample(require('./examples/basic-usage-examples'));
  printExample.logExample(require('./examples/col-and-row-span-examples'));
});

gulp.task('example-md', ['example-md-basic', 'example-md-advanced']);
gulp.task('example-md-basic', function(cb) {
  printExample.mdExample(require('./examples/basic-usage-examples'), 'basic-usage.md', cb);
});
gulp.task('example-md-advanced', function(cb) {
  printExample.mdExample(require('./examples/col-and-row-span-examples'), 'advanced-usage.md', cb);
});

function coverage(opts) {
  opts = opts || {};

  function coverageTask(cb) {
    gulp
      .src(['src/*.js'])
      .pipe(istanbul())
      .pipe(istanbul.hookRequire())
      .on('error', logMochaError)
      .on('finish', function() {
        gulp
          .src(['test/*.js'])
          .pipe(mocha(opts))
          .on('error', function(err) {
            logMochaError(err);
            if (cb) cb(err);
          })
          .pipe(istanbul.writeReports())
          .on('end', function() {
            if (cb) cb();
          });
      });
  }

  return coverageTask;
}

function mochaTask() {
  return gulp
    .src(['test/*.js'], { read: false })
    .pipe(
      mocha({
        growl: true
      })
    )
    .on('error', logMochaError);
}

function logMochaError(err) {
  if (err && err.message) {
    gutil.log(err.message);
  } else {
    gutil.log.apply(gutil, arguments);
  }
}
