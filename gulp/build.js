const { src, dest } = require('gulp')
const del = require('del')
const cleanCSS = require('gulp-clean-css')
const sass = require('gulp-sass')(require('node-sass'))
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')
const concat = require('gulp-concat')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackProd = require('../webpack.prod.js')

const clean = () => del(['bundle/*'])

const minifyStyles = () =>
	src('src/**/*.scss')
		.pipe(sass().on('error', notify.onError()))
		.pipe(
			cleanCSS({
				level: 2,
			})
		)
		.pipe(dest('bundle/css/'))

const uglifyScripts = () => {
	src('src/lib/scripts/*.js')
		.pipe(concat('vendor.js'))
		.pipe(uglify().on('error', notify.onError()))
		.pipe(dest('bundle/js'))
	return src(['src/components/**/*.js', 'src/layouts/**/*.js', 'src/global/**/*.js', 'src/main.js'])
		.pipe(uglify().on('error', notify.onError()))
		.pipe(webpackStream(webpackProd), webpack)
		.pipe(dest('bundle/js'))
}

const compressImages = async () => {
	const image = await import('gulp-image')

	return src(['src/img/**.{jpg,png,jpeg,svg}', 'src/img/**/*.{jpg,png,jpeg}'])
		.pipe(image.default())
		.pipe(dest('bundle/img'))
}

module.exports = { clean, minifyStyles, uglifyScripts, compressImages }
