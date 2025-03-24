const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const minify = require('gulp-minify');
const webpack = require('webpack-stream');
const cleanCSS = require('gulp-clean-css');
const node_path = require("path");
//To Minify CSS files


const scss_include_paths = [ './scss/includes'];

/* SCSS */

gulp.task('theme_css', function () {
    return gulp.src([
        './scss/theme.scss',
    ])
        .pipe(sass({
            loadPaths: scss_include_paths,
            //outputStyle: 'compressed'
        }, {}).on('error', sass.logError))
        .pipe(postcss([
            tailwindcss('./tailwind.config.js')
        ], false))
        .pipe(rename({
            extname: ".min.css",
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('../public/wp-content/themes/wp-block-studio/dist/'))
});
gulp.task('admin_css', function () {
    return gulp.src([
        './scss/admin.scss',
    ])
        .pipe(sass({
            loadPaths: scss_include_paths,
            //outputStyle: 'compressed'
        }, {}).on('error', sass.logError))
        .pipe(postcss([
            tailwindcss('./tailwind.config.js')
        ], false))
        .pipe(rename({
            extname: ".min.css",
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('../public/wp-content/themes/wp-block-studio/dist/'))
});

gulp.task('blocks_css', function () {
    return gulp.src([
        './blocks/**/css/block.scss'
    ], {base: "."})
        .pipe(sass({
            loadPaths: scss_include_paths,
            //outputStyle: 'compressed'
        },false).on('error', sass.logError))
        .pipe(postcss([
            tailwindcss('./tailwind.config.js')
        ], false))
        .pipe(rename(function (path) {
            return {
                basename: path.basename,
                dirname: node_path.basename(node_path.resolve(path.dirname + '/', '..') + '/'),
                extname: ".min.css",
            };

        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('../public/wp-content/themes/wp-block-studio/dist/blocks/'))
});

gulp.task('js', function () {
    return gulp
        .src('./js/')
        .pipe(
            webpack({
                entry: {
                    theme: './js/theme.js',
                },
                output: {
                    filename: "[name].min.js",
                },
                module: {
                    rules: [{
                        test: /.(js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ["@babel/preset-env", "@babel/preset-react"]
                            }
                        },
                    }]
                },
                mode: 'production'
            })
        )
        .pipe(gulp.dest('../public/wp-content/themes/wp-block-studio/dist/'));
});


/* RUN TASKS */

gulp.task('build', gulp.series([
    'theme_css','admin_css','blocks_css', 'js',
]));

gulp.task('default', function () {
    gulp.watch(
        [
            './*.{js,scss}',
            './**/*.{js,scss}',
            './**/**/*.{js,scss}',
        ],
        {
            ignoreInitial: false
        },
        gulp.series(['build'])
    );
});