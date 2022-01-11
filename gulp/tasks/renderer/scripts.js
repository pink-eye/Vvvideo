const { src, dest, watch, series } = require('gulp')
const del = require('del')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackDev = require('../../../webpack.dev.js')
const webpackProd = require('../../../webpack.prod.js')

const cleanScripts = () => del([`${app.paths.bundle}/js/*`])

const bundleScripts = () => {
	src(`${app.paths.renderer}/lib/scripts/*.js`)
		.pipe(concat('vendor.js'))
		.pipe(dest(`${app.paths.bundle}/js/`))
	return src([
		`${app.paths.renderer}/components/**/*.js`,
		`${app.paths.renderer}/layouts/**/*.js`,
		`${app.paths.renderer}/global/**/*.js`,
		`${app.paths.renderer}/main.js`,
	])
		.pipe(webpackStream(webpackDev), webpack)
		.pipe(dest(`${app.paths.bundle}/js`))
}

const bundleAndUglifyScripts = () => {
	src(`${app.paths.renderer}/lib/scripts/*.js`)
		.pipe(concat('vendor.js'))
		.pipe(uglify().on('error', notify.onError()))
		.pipe(dest(`${app.paths.bundle}/js`))
	return src([
		`${app.paths.renderer}/components/**/*.js`,
		`${app.paths.renderer}/layouts/**/*.js`,
		`${app.paths.renderer}/global/**/*.js`,
		`${app.paths.renderer}/main.js`,
	])
		.pipe(uglify().on('error', notify.onError()))
		.pipe(webpackStream(webpackProd), webpack)
		.pipe(dest(`${app.paths.bundle}/js`))
}

const transformScripts = () => (app.isProd ? bundleAndUglifyScripts() : bundleScripts())

const watchScripts = done => {
	if (app.isProd) {
		done()
		return
	}

	watch(
		[
			`${app.paths.renderer}/components/**/*.js`,
			`${app.paths.renderer}/layouts/**/*.js`,
			`${app.paths.renderer}/global/**/*.js`,
			`${app.paths.renderer}/main.js`,
		],
		bundleScripts
	)
}

const runScripts = series(cleanScripts, transformScripts, watchScripts)

module.exports = runScripts
