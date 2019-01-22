var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename');

gulp.task('js', function(cb) {
    return gulp.src('./src/lib/*.*')
        .pipe(gulp.dest('./dist/lib/'));
});

gulp.task('uglify', ['js'], function() {
    gulp.src(['./src/lib/pullLoading.js'])
        .pipe(uglify())
        .pipe(rename('pullLoading.min.js'))
        .pipe(gulp.dest('./dist/lib'));
});

gulp.task('copy', function() {
    gulp.src(['./src/images/*.*'])
        .pipe(gulp.dest('./dist/images/'));
    gulp.src(['./src/*.html'])
        .pipe(gulp.dest('./dist/'));
    gulp.src(['./src/lib/*.css'])
        .pipe(gulp.dest('./dist/lib'));
});

gulp.task('watch', function() {
    gulp.watch('./src/lib/*.js', ['js']);
    gulp.watch(['./src/images/*.*'], ['copy']);
    gulp.watch(['./src/*.html'], ['copy']);
});

gulp.task('server', function() {
    connect.server({
        port: 8080,
        root: './dist/'
    });
});

gulp.task("default", ['js', 'copy', 'watch', 'server']);
gulp.task("build", ['js', 'uglify', 'copy']);
