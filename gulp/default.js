const { src, dest, watch } = require('gulp')
const del = require('del')
const fileInclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')

const cleanDefault = () => del(['bundle/*', '!bundle/css', '!bundle/js'])

const moveResources = () => src('src/res/**').pipe(dest('bundle'))

const moveImages = () => src('src/img/**').pipe(dest('bundle/img'))

const transformHTML = () =>
	src('src/**/*.html')
		.pipe(
			fileInclude({
				prefix: '@',
				basepath: '@file',
				indent: true,
			})
		)
		.pipe(dest('bundle'))

const minifyHTML = () =>
	src('bundle/*.html')
		.pipe(
			htmlmin({
				collapseWhitespace: true,
			})
		)
		.pipe(dest('bundle'))

const watchFiles = () => {
	watch('src/**/*.html', transformHTML)
	watch('src/res/**', moveResources)
	watch('src/img/**', moveImages)
}

module.exports = {
	cleanDefault,
	transformHTML,
	minifyHTML,
	moveResources,
	moveImages,
	watchFiles,
}
