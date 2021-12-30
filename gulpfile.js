const { series, parallel } = require('gulp')
const { cleanDefault, transformHTML, minifyHTML, moveResources, moveImages, watchFiles } = require('./gulp/default')
const { cleanStyles, compileStyles, watchStyles } = require('./gulp/styles')
const { cleanScripts, lintScripts, bundleModules, watchScripts } = require('./gulp/scripts')
const { clean, minifyStyles, uglifyScripts, compressImages } = require('./gulp/build')

const runDefault = () => series(cleanDefault, parallel(transformHTML, moveResources, moveImages), watchFiles)

const runStyles = () => series(cleanStyles, compileStyles, watchStyles)

const runScripts = () => series(cleanScripts, bundleModules, watchScripts)

exports.default = runDefault

exports.styles = runStyles

exports.scripts = runScripts

exports.lintJS = lintScripts

exports.dev = parallel(runDefault(), runScripts(), runStyles())

exports.build = series(
	clean,
	transformHTML,
	minifyHTML,
	moveImages,
	parallel(compressImages, moveResources),
	parallel(minifyStyles, uglifyScripts)
)
