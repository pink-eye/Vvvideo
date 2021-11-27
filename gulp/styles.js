const { src, dest, watch } = require('gulp')
const sass = require('gulp-sass')(require('node-sass'))
const del = require('del')
const sourcemaps = require('gulp-sourcemaps')
const notify = require('gulp-notify')

const cleanStyles = () => del(['bundle/css/*'])

const compileStyles = () =>
	src('src/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', notify.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('bundle/css/'))

const watchStyles = () => {
	watch('src/**/*.scss', compileStyles)
}

module.exports = { cleanStyles, compileStyles, watchStyles }
