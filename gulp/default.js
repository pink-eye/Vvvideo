const { src, dest, watch, series, parallel } = require('gulp')
const del = require('del')
const fileInclude = require('gulp-file-include')
const paths = require('./paths.js')

const cleanDefault = () => del([`${paths.bundle}/*`, `!${paths.bundle}/css`, `!${paths.bundle}/js`])

const moveResources = () => src(`${paths.renderer}/res/**`).pipe(dest(`${paths.bundle}`))

const moveImages = () => src(`${paths.renderer}/img/**`).pipe(dest(`${paths.bundle}/img`))

const transformHTML = () =>
	src(`${paths.renderer}/*.html`)
		.pipe(
			fileInclude({
				prefix: '@',
				basepath: '@file',
				indent: true,
			})
		)
		.pipe(dest(`${paths.bundle}`))

const watchFiles = () => {
	watch(`${paths.renderer}/**/*.html`, transformHTML)
	watch(`${paths.renderer}/res/**`, moveResources)
	watch(`${paths.renderer}/img/**`, moveImages)
}

const runDefault = () =>
	series(cleanDefault, parallel(transformHTML, moveResources, moveImages), watchFiles)

module.exports = { runDefault, moveResources, transformHTML, moveImages }
