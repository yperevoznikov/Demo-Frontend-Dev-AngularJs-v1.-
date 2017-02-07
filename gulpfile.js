
var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    bytediff = require('gulp-bytediff'),
    uglify = require('gulp-uglify'),
    templateCache = require('gulp-angular-templatecache'),
    notify = require("gulp-notify"),
    fileinclude = require('gulp-file-include'),
    minifyCss = require('gulp-minify-css'),
    less = require('gulp-less'),
    pkg = require('./package.json');

gulp.task('js', function() {
    var source = pkg.paths.js;

    return gulp.src(source)
        .pipe(sourcemaps.init())
        .pipe(concat('all.min.js', {newLine: ';'}))
        // Annotate before uglify so the code get's min'd properly.
        .pipe(ngAnnotate({
            // true helps add where @ngInject is not used. It infers.
            // Doesn't work with resolve, so we must be explicit there
            add: true
        }))
        .pipe(bytediff.start())
        .pipe(uglify({mangle: true}))
        .pipe(bytediff.stop())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(pkg.paths.build));
});

gulp.task('vendorjs', function() {
    return gulp.src(pkg.paths.vendorjs)
        .pipe(concat('vendor.min.js'))
        .pipe(bytediff.start())
        .pipe(uglify())
        .pipe(bytediff.stop())
        .pipe(gulp.dest(pkg.paths.stage));
});

gulp.task('less', function() {
    gulp.src(pkg.paths.less)
        .pipe(concat('all.min.css'))
        .pipe(less())
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest(pkg.paths.build));
});

gulp.task('vendorcss', function() {
    return gulp.src(pkg.paths.vendorcss)
        .pipe(concat('vendor.min.css'))
        .pipe(bytediff.start())
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(bytediff.stop())
        .pipe(gulp.dest(pkg.paths.stage));
});

gulp.task('templates', function() {
    return gulp.src(pkg.paths.templates)
        .pipe(templateCache('templates.js', {
            standalone: false
        }))
        .pipe(gulp.dest(pkg.paths.stage));
});

gulp.task('pages', function() {
    gulp.src(pkg.paths.pages)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(pkg.paths.build));
});

gulp.task('watch', ['vendorjs', 'js'], function() {

    // LESS / CSS
    var css = ['gulpfile.js'].concat(pkg.paths.less, pkg.paths.lessIncludes, pkg.paths.vendorcss);
    gulp
        .watch(css, ['less', 'vendorcss'])
        .on('change', logWatch);

    // JavaScript
    var js = ['gulpfile.js'].concat(pkg.paths.js);
    gulp
        .watch(js, ['js', 'vendorjs'])
        .on('change', logWatch);

    // HTML Templates
    var templates = ['gulpfile.js'].concat(pkg.paths.templates);
    gulp
        .watch(templates, ['templates'])
        .on('change', logWatch);

    // HTML Pages
    var pages = ['gulpfile.js'].concat(pkg.paths.pages, pkg.paths.pageIncludes);
    gulp
        .watch(pages, ['pages'])
        .on('change', logWatch);

    function logWatch(event) {
        log('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
    }
});

gulp.task('default', [
    'vendorjs',
    'js',
    'vendorcss',
    'less',
    'templates',
    'pages'
]);

function log(message) {
    gulp.src('').pipe(notify(message));
    console.log(message);
}