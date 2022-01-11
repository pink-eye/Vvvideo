const { src, dest, watch, series, parallel } = require('gulp')
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')

const moveJson = () => src(`${app.paths.main}/**/*.json`).pipe(dest(`${app.paths.bundle}`))

const uglifyScripts = () =>
	src(`${app.paths.main}/**/*.js`)
		.pipe(uglify().on('error', notify.onError()))
		.pipe(dest(`${app.paths.bundle}`))

const watchMainProcess = done => {
	if (app.isProd) {
		done()
		return
	}

	watch(`${app.paths.main}/**/*.js`, uglifyScripts)
	watch(`${app.paths.main}/**/*.json`, moveJson)
}

const runMainProcess = series(parallel(moveJson, uglifyScripts), watchMainProcess)

module.exports = runMainProcess
