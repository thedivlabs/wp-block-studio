const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const minify = require('gulp-minify');
const webpack = require('webpack-stream');
const cleanCSS = require('gulp-clean-css');//To Minify CSS files


const scss_include_paths = [ './includes'];

/* SCSS */

gulp.task('theme_css', function () {
    return gulp.src([
        "./scss/theme.scss"
    ])
        .pipe(sass({
            includePaths: './scss/includes/',
            //outputStyle: 'compressed'
        }, {}).on('error', sass.logError))
        .pipe(postcss([
            tailwindcss('./tailwind.config.js')
        ], false))
        .pipe(rename({
            extname: ".min.css",
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('../public/wp-content/themes/wp-block-studio/dist/css/'))
});

/* RUN TASKS */

gulp.task('build', gulp.series([
    'theme_css',
]));

gulp.task('default', function () {
    gulp.watch(
        [
            './**/*.{js,scss}'
        ],
        {
            ignoreInitial: false
        },
        gulp.series(['build'])
    );
});