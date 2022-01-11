const { src, dest } = require('gulp')
const del = require('del')
const cleanCSS = require('gulp-clean-css')
const sass = require('gulp-sass')(require('node-sass'))
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')
const concat = require('gulp-concat')
const webpack = require('webpack')
const htmlmin = require('gulp-htmlmin')
const webpackStream = require('webpack-stream')
const webpackProd = require('../webpack.prod.js')
const paths = require('./paths.js')

const clean = () => del([`${paths.bundle}/*`])

const minifyHTML = () =>
	src(`${paths.bundle}/*.html`)
		.pipe(
			htmlmin({
				collapseWhitespace: true,
			})
		)
		.pipe(dest(`${paths.bundle}`))

const minifyStyles = () =>
	src(`${paths.renderer}/**/*.scss`)
		.pipe(sass().on('error', notify.onError()))
		.pipe(
			cleanCSS({
				level: 2,
			})
		)
		.pipe(dest(`${paths.bundle}/css`))

const uglifyScripts = () => {
	src(`${paths.renderer}/lib/scripts/*.js`)
		.pipe(concat('vendor.js'))
		.pipe(uglify().on('error', notify.onError()))
		.pipe(dest(`${paths.bundle}/js`))
	return src([
		`${paths.renderer}/components/**/*.js`,
		`${paths.renderer}/layouts/**/*.js`,
		`${paths.renderer}/global/**/*.js`,
		`${paths.renderer}/main.js`,
	])
		.pipe(uglify().on('error', notify.onError()))
		.pipe(webpackStream(webpackProd), webpack)
		.pipe(dest(`${paths.bundle}/js`))
}

const compressImages = async () => {
	const image = await import('gulp-image')

	return src([
		`${paths.renderer}/img/**.{jpg,png,jpeg,svg}`,
		`${paths.renderer}/img/**/*.{jpg,png,jpeg}`,
	])
		.pipe(image.default())
		.pipe(dest(`${paths.bundle}/img`))
}

module.exports = { clean, minifyHTML, compressImages, minifyStyles, uglifyScripts }
