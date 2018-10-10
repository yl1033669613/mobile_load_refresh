var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect');

gulp.task('js', function(cb) {
    return gulp.src('./src/js/*.*')
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('uglify',['js'], function() {
    gulp.src(['./src/js/pullLoading.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy', function() {
    gulp.src(['./src/images/*.*'])
        .pipe(gulp.dest('./dist/images/'));
    gulp.src(['./src/*.html'])
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
    gulp.watch('./src/js/*.js', ['js']);
    gulp.watch(['./src/images/*.*'], ['copy']);
    gulp.watch(['./src/*.html'], ['copy']);
});

gulp.task('server', function() {
    connect.server({
        port: 8081,
        root: './dist/'
    });
});

gulp.task("default", ['js', 'copy', 'watch', 'server']);
gulp.task("build", ['uglify', 'copy']);
