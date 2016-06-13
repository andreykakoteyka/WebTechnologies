'use strict';

var gulp = require('gulp'); // Gulp JS
var sass = require('gulp-sass'); //Sass

var staticFolder = 'static';

gulp.task('sass', function () {
    gulp.src('scss/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest(staticFolder + '/css/'));
});
gulp.task('sass:watch', function () {
    gulp.watch('scss/**/*.scss', ['sass']);
});

gulp.task('js', function () {
   gulp.src('js/**/*.js')
       .pipe(gulp.dest(staticFolder + '/js'));
});

gulp.task('js:watch', function () {
    gulp.watch('js/**/*.js', ['js']);
});


gulp.task('build', ['sass', 'js']);

gulp.task('serve', ['build', 'sass:watch', 'js:watch']);