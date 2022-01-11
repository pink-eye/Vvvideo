const { series, parallel } = require('gulp')
const { runMainProcessDev, runMainProcessBuild } = require('./gulp/main-process')
const { runDefault, moveResources, transformHTML, moveImages } = require('./gulp/default')
const runStyles = require('./gulp/styles')
const { lintScripts, runScripts } = require('./gulp/scripts')
const { clean, minifyHTML, compressImages, minifyStyles, uglifyScripts } = require('./gulp/build')

exports.default = runDefault

exports.styles = runStyles

exports.scripts = runScripts

exports.lintJS = lintScripts

exports.dev = parallel(runDefault(), runScripts(), runStyles(), runMainProcessDev())

exports.build = series(
	clean,
	moveResources,
	transformHTML,
	minifyHTML,
	moveImages,
	compressImages,
	minifyStyles,
	uglifyScripts,
	runMainProcessBuild()
)
