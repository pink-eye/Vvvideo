const { series, parallel } = require('gulp')
const runMainProcess = require('./gulp/tasks/main')
const runRendererProcess = require('./gulp/tasks/renderer')
const lintScripts = require('./gulp/tasks/renderer/lint-scripts')
const paths = require('./gulp/config/paths')
const del = require('del')

global.app = {
	isProd: process.argv.includes('--prod'),
	paths,
}

const clean = () => del([`${app.paths.bundle}/*`])

exports.lintJS = lintScripts

exports.default = series(clean, parallel(runRendererProcess, runMainProcess))
