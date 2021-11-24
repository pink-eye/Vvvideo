const { series, parallel } = require('gulp')
const { cleanDefault, transformHTML, minifyHTML, moveResources, moveImages, watchFiles } = require('./gulp/default')
const { cleanStyles, compileStyles, watchStyles } = require('./gulp/styles')
const { cleanScripts, lintScripts, bundleModules, watchScripts } = require('./gulp/scripts')
const { clean, minifyStyles, uglifyScripts, compressImages } = require('./gulp/build')

exports.default = series(cleanDefault, parallel(transformHTML, moveResources, moveImages), watchFiles)

exports.styles = series(cleanStyles, compileStyles, watchStyles)

exports.scripts = series(cleanScripts, bundleModules, watchScripts)

exports.lintJS = lintScripts

exports.build = series(
	clean,
	transformHTML,
	minifyHTML,
	moveImages,
	parallel(compressImages, moveResources),
	parallel(minifyStyles, uglifyScripts)
)
