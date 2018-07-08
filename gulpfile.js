var gulp = require('gulp'),
	browserSync = require('browser-sync')
	.create(),
	cleanCSS = require('gulp-clean-css'),
	autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	sassLint = require('gulp-sass-lint'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	sourcemaps = require('gulp-sourcemaps'),
	size = require('gulp-size'),
	strip = require('gulp-strip-comments'),
	postcss = require('gulp-postcss'),
	flexBugs = require('postcss-flexbugs-fixes');

/*
  -- TOP LEVEL FUNCTIONS --
  gulp.task - Define tasks
  gulp.src - Point to files to use
  gulp.dest - Points to folder to output
  gulp.watch - Watch files and folders for changes
*/

// Various vars

var sassOptions = {
	outputStyle: 'expanded'
};

var prefixerOptions = {
	cascade: false,
	grid: true
};

// Logs Message
gulp.task('message', function() {
	return console.log('Gulp is running...');
});

// Copy All HTML files
gulp.task('copyHtml', function() {
	return gulp.src('src/*.html')
		.pipe(plumber())
		.pipe(strip())
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.stream());
});

// Optimize Images
gulp.task('imageMin', function() {
	gulp.src('src/images/*')
		.pipe(plumber())
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
      }]
		}))
		.pipe(gulp.dest('dist/images'))
});

// Compile Sass
gulp.task('sass', function() {
	return gulp.src('src/sass/**/*.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions)
			.on('error', sass.logError))
		.pipe(postcss(flexBugs))
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(autoprefixer(prefixerOptions))
		.pipe(rename('style.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream())
		.pipe(cleanCSS({
			debug: true
		}, function(details) {
			console.log(details.name + ': ' + details.stats.originalSize);
			console.log(details.name + ': ' + details.stats.minifiedSize);
		}))
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

// Lint Sass
gulp.task('sass-lint', function() {
	return gulp.src('src/sass/**/*.scss')
		.pipe(plumber())
		.pipe(sassLint())
		.pipe(sassLint.format())
		.pipe(sassLint.failOnError());
});

// Scripts
gulp.task('scripts', function() {
	return gulp.src('src/js/*.js')
		.pipe(plumber())
		.pipe(uglify())
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream());
});

// Linting JS
gulp.task('lint', function() {
	return gulp.src('src/js/*.js')
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

// Copy JS vendor files
gulp.task('copyJSVendor', function() {
	return gulp.src('src/js/vendor/*.js')
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest('dist/js/vendor'))
		.pipe(browserSync.stream());
});

// Copy Fonts folder
gulp.task('copyFonts', function() {
	return gulp.src('src/fonts/**')
		.pipe(plumber())
		.pipe(gulp.dest('dist/fonts'))
		.pipe(browserSync.stream());
});

// Serve
gulp.task('serve', ['sass'], function() {
	return browserSync.init({
		server: "./dist"
	});
});

// Watch
gulp.task('watch', function() {
	gulp.watch('src/*.html', ['copyHtml'])
		.on('change', browserSync.reload);
	gulp.watch('src/sass/**/*.scss', ['sass', 'sass-lint']);
	gulp.watch('src/js/*.js', ['scripts'])
		.on('change', browserSync.reload);
	gulp.watch('src/images/*', ['imageMin'])
		.on('change', browserSync.reload);
});

// default task
gulp.task('default', ['message', 'copyHtml', 'sass', 'scripts', 'copyJSVendor', 'copyFonts', 'imageMin', 'serve',
	'watch']);
