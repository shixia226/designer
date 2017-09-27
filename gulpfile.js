var gulp = require('gulp');

var jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    css = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    base64 = require('gulp-base64');

var Server = require('karma').Server;

gulp.task("check", function () {
    gulp.src('./src/js/core/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
    gulp.src('./src/js/cmp/**/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
    gulp.src('./src/js/util/editor.js').pipe(jshint()).pipe(jshint.reporter('default'));
    gulp.src('./server/**/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
});

function buildCss() {
    return gulp.src(['./src/scss/**/*.scss', './src/scss/**/*.css']).pipe(sass()).pipe(base64({})).pipe(concat('eui.css'));;
}

function buildCoreScript() {
    return gulp.src([
        './src/js/core/lib.js',
        './src/js/core/i18n.js',
        './src/js/core/dom.js',
        './src/js/core/event.js',
        './src/js/core/ajax.js',
        './src/js/core/constants.js',
        './src/js/core/dragdrop.js',
        './src/js/core/require.js',
        './src/js/config.js',
        './src/js/cmp/base/cmp.js'
    ]).pipe(concat('eui.js'));
}

function buildScript() {
    return gulp.src([
        './src/js/cmp/**/*.js',
        './src/js/designer/*.js',
        './src/js/util/*.js'
    ], { base: './src/js' });
    // return gulp.src(['./src/js/**/*.js', '!./src/js/core/*.js']);
}

function buildHtml() {
    return gulp.src('./src/page/**/*.html', { base: './src/page' });
}

gulp.task('dev-css', function () {
    buildCss().pipe(gulp.dest('./public/css'));
});
gulp.task('dev-script', function () {
    buildCoreScript().pipe(gulp.dest('./public/js'));
    buildScript().pipe(gulp.dest('./public/js'));
});
gulp.task('dev-html', function () {
    buildHtml().pipe(gulp.dest('./public/page'));
});

gulp.task('karma', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js'
        // , singleRun: true
    }, done).start();
});

gulp.task('css', function () {
    buildCss().pipe(css())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./public/css'));
});
gulp.task('script', function () {
    buildCoreScript().pipe(rename('eui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'));
    buildScript().pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./public/js'));
});
gulp.task('html-test', function () {
    gulp.src('./spec/html/*.html').pipe(gulp.dest('./public/test'));
});
gulp.task('html', function () {
    buildHtml().pipe(gulp.dest('./public/page'));
});

gulp.task('build', ['check', 'css', 'script']);

gulp.task('watch', function () {
    gulp.watch(['./src/**/*', './spec/html/*'], ['check', 'dev-css', 'dev-script', 'dev-html', 'html-test']);
});

gulp.task('dev', ['check', 'dev-css', 'dev-script', 'dev-html']);

gulp.task('test', ['check', 'dev-css', 'dev-script', 'karma', 'watch']);