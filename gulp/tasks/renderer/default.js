const { src, dest, watch, series, parallel } = require('gulp')
const fileInclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const del = require('del')

const cleanDefault = () =>
	del([`${app.paths.bundle}/*`, `!${app.paths.bundle}/css`, `!${app.paths.bundle}/js`])

const moveResources = () => src(`${app.paths.renderer}/res/**`).pipe(dest(`${app.paths.bundle}`))

const moveImages = () => src(`${app.paths.renderer}/img/**`).pipe(dest(`${app.paths.bundle}/img`))

const compressImages = async done => {
	if (!app.isProd) {
		done()
		return
	}

	const image = await import('gulp-image')

	return src([
		`${app.paths.renderer}/img/**.{jpg,png,jpeg,svg}`,
		`${app.paths.renderer}/img/**/*.{jpg,png,jpeg}`,
	])
		.pipe(image.default())
		.pipe(dest(`${app.paths.bundle}/img`))
}

const transformHTML = () =>
	src(`${app.paths.renderer}/*.html`)
		.pipe(
			fileInclude({
				prefix: '@',
				basepath: '@file',
				indent: true,
			})
		)
		.pipe(dest(`${app.paths.bundle}`))

const minifyHTML = done => {
	if (!app.isProd) {
		done()
		return
	}

	return src(`${app.paths.bundle}/*.html`)
		.pipe(
			htmlmin({
				collapseWhitespace: true,
			})
		)
		.pipe(dest(`${app.paths.bundle}`))
}

const watchDefault = done => {
	if (app.isProd) {
		done()
		return
	}

	watch(`${app.paths.renderer}/**/*.html`, transformHTML)
	watch(`${app.paths.renderer}/res/**`, moveResources)
	watch(`${app.paths.renderer}/img/**`, moveImages)
}

const runDefault = series(
	cleanDefault,
	parallel(moveResources, transformHTML, moveImages),
	compressImages,
	minifyHTML,
	watchDefault
)

module.exports = runDefault
