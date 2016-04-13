'use strict';

var gulp = require('gulp'); // Gulp JS
var sass = require('gulp-sass'); //Sass

gulp.task('sass', function () {
    gulp.src('scss/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest('css/'));
});
gulp.task('sass:watch', function () {
    gulp.watch('scss/**/*.scss', ['sass']);
});


gulp.task('build', ['sass']);

gulp.task('serve', ['build', 'sass:watch']);