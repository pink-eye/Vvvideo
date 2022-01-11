const { parallel } = require('gulp')
const runDefault = require('./default')
const runScripts = require('./scripts')
const runStyles = require('./styles')

const runRendererProcess = parallel(runDefault, runScripts, runStyles)

module.exports = runRendererProcess
