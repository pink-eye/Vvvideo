const { src, dest, watch, series } = require('gulp')
const sass = require('gulp-sass')(require('node-sass'))
const cleanCSS = require('gulp-clean-css')
const del = require('del')
const sourcemaps = require('gulp-sourcemaps')
const notify = require('gulp-notify')

const cleanStyles = () => del([`${app.paths.bundle}/css/*`])

const compileStyles = () =>
	src(`${app.paths.renderer}/**/*.scss`)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', notify.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(`${app.paths.bundle}/css/`))

const compileAndMinifyStyles = () =>
	src(`${app.paths.renderer}/**/*.scss`)
		.pipe(sass().on('error', notify.onError()))
		.pipe(
			cleanCSS({
				level: 2,
			})
		)
		.pipe(dest(`${app.paths.bundle}/css`))

const transformStyles = () => (app.isProd ? compileAndMinifyStyles() : compileStyles())

const watchStyles = done => {
	if (app.isProd) {
		done()
		return
	}

	watch(`${app.paths.renderer}/**/*.scss`, compileStyles)
}

const runStyles = series(cleanStyles, transformStyles, watchStyles)

module.exports = runStyles
