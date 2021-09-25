const {
	src,
	dest,
	series,
	watch
} = require('gulp');
// const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require("gulp-sass")(require("node-sass"));
const svgSprite = require('gulp-svg-sprite');
const fileInclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const revDel = require('gulp-rev-delete-original');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const notify = require('gulp-notify');
const image = require('gulp-image');
const { readFileSync } = require('fs');
const concat = require('gulp-concat');

let isProd = false;

const clean = () => {
	return del(['bundle/*'])
}

// const svgSprites = () => {
// 	return src('./src/img/svg/**.svg')
// 		.pipe(svgSprite({
// 			mode: {
// 				stack: {
// 					sprite: "../sprite.svg"
// 				}
// 			},
// 		}))
// 		.pipe(dest('./bundle/img'));
// }

const styles = () => {
	return src('./src/scss/**/*.scss')
		.pipe(gulpif(!isProd, sourcemaps.init()))
		.pipe(sass().on("error", notify.onError()))
		// .pipe(autoprefixer({
		// 	cascade: false,
		// }))
		.pipe(gulpif(isProd, cleanCSS({
			level: 2
		})))
		.pipe(gulpif(!isProd, sourcemaps.write('.')))
		.pipe(dest('./bundle/css/'))
		.pipe(browserSync.stream());
};

const scripts = () => {
	src('./src/js/vendor/**.js')
		.pipe(concat('vendor.js'))
		.pipe(gulpif(isProd, uglify().on("error", notify.onError())))
		.pipe(dest('./bundle/js/'))
	return src(
		['./src/js/global.js', './src/js/components/**.js', './src/js/main.js'])
		.pipe(gulpif(!isProd, sourcemaps.init()))
		.pipe(concat('main.js'))
		.pipe(gulpif(isProd, uglify().on("error", notify.onError())))
		.pipe(gulpif(!isProd, sourcemaps.write('.')))
		.pipe(dest('./bundle/js'))
		.pipe(browserSync.stream());
}

const resources = () => {
	return src('./src/res/**')
		.pipe(dest('./bundle'))
}

const images = () => {
	return src([
		'./src/img/**.jpg',
		'./src/img/**.png',
		'./src/img/**.jpeg',
		'./src/img/**.svg',
		'./src/img/**/*.jpg',
		'./src/img/**/*.png',
		'./src/img/**/*.jpeg',
	])
		.pipe(gulpif(isProd, image()))
		.pipe(dest('./bundle/img'))
		.pipe(browserSync.stream());
};

const moveSprites = () => {
	return src(['./src/img/svg/*.svg'])
		.pipe(dest('./bundle/img/svg'))
		.pipe(browserSync.stream());
};

const htmlInclude = () => {
	return src(['./src/*.html'])
		.pipe(fileInclude({
			prefix: '@',
			basepath: '@file'
		}))
		.pipe(dest('./bundle'))
		.pipe(browserSync.stream());
}


const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: "./bundle"
		},
	});

	watch('./src/scss/**/*.scss', styles);
	watch('./src/js/**/*.js', scripts);
	watch('./src/html/*.html', htmlInclude);
	watch('./src/*.html', htmlInclude);
	watch('./src/res/**', resources);
	watch('./src/img/*.{jpg,jpeg,png,svg}', images);
	watch('./src/img/**/*.{jpg,jpeg,png}', images);
	watch('./src/img/svg/*.svg', moveSprites);
	// watch('./src/img/svg/**.svg', svgSprites);
}

const cache = () => {
	return src('bundle/**/*.{css,js,svg,png,jpg,jpeg,woff2}', {
		base: 'bundle'
	})
		.pipe(rev())
		.pipe(dest('bundle'))
		.pipe(revDel())
		.pipe(rev.manifest('rev.json'))
		.pipe(dest('bundle'));
};

const rewrite = () => {
	const manifest = readFileSync('bundle/rev.json');

	return src('bundle/**/*.html')
		.pipe(revRewrite({
			manifest
		}))
		.pipe(dest('bundle'));
}

const htmlMinify = () => {
	return src('bundle/**/*.html')
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(dest('bundle'));
}

const toProd = (done) => {
	isProd = true;
	done();
};

exports.default = series(clean, htmlInclude, scripts, styles, resources, images, moveSprites, watchFiles);

exports.build = series(toProd, clean, htmlInclude, scripts, styles, resources, images, moveSprites, htmlMinify);

exports.cache = series(cache, rewrite);
