const { src, dest, watch, series } = require('gulp')
const sass = require('gulp-sass')(require('node-sass'))
const del = require('del')
const sourcemaps = require('gulp-sourcemaps')
const notify = require('gulp-notify')
const paths = require('./paths.js')

const cleanStyles = () => del([`${paths.bundle}/css/*`])

const compileStyles = () =>
	src(`${paths.renderer}/**/*.scss`)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', notify.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(`${paths.bundle}/css/`))

const watchStyles = () => watch(`${paths.renderer}/**/*.scss`, compileStyles)

const runStyles = () => series(cleanStyles, compileStyles, watchStyles)

module.exports = runStyles
