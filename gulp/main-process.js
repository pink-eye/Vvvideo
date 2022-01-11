const { src, dest, watch, series } = require('gulp')
const paths = require('./paths.js')
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')

const moveJson = () => src(`${paths.main}/**/*.json`).pipe(dest(`${paths.bundle}`))

const uglifyScripts = () =>
	src(`${paths.main}/**/*.js`)
		.pipe(uglify().on('error', notify.onError()))
		.pipe(dest(`${paths.bundle}`))

const watchMainProcess = () => {
	watch(`${paths.main}/**/*.json`, moveJson)
	watch(`${paths.main}/**/*.js`, uglifyScripts)
}

const runMainProcessBuild = () => series(moveJson, uglifyScripts)

const runMainProcessDev = () => series(runMainProcessBuild, watchMainProcess)

module.exports = { runMainProcessDev, runMainProcessBuild }
