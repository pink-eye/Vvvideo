const { src, dest } = require('gulp')
const del = require('del')
const image = require('gulp-image')
const cleanCSS = require('gulp-clean-css')
const sass = require('gulp-sass')(require('node-sass'))
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('../webpack.config.js')

const clean = () => del(['bundle/*'])

const minifyStyles = () =>
	src('./src/scss/**/*')
		.pipe(sass().on('error', notify.onError()))
		.pipe(
			cleanCSS({
				level: 2,
			})
		)
		.pipe(dest('./bundle/css/'))

const uglifyScripts = () => {
	src('./src/js/vendor/**.js')
		.pipe(concat('vendor.js'))
		.pipe(uglify().on('error', notify.onError()))
		.pipe(dest('./bundle/js/'))
	return src(['./src/js/global.js', './src/js/components/**.js', './src/js/main.js'])
		.pipe(webpackStream(webpackConfig), webpack)
		.pipe(uglify().on('error', notify.onError()))
		.pipe(dest('./bundle/js'))
}

const compressImages = () =>
	src(['./src/img/**.{jpg,png,jpeg,svg}', './src/img/**/*.{jpg,png,jpeg}']).pipe(image()).pipe(dest('./bundle/img'))

module.exports = { clean, minifyStyles, uglifyScripts, compressImages }
