const { src } = require('gulp')
const eslint = require('gulp-eslint-new')
const chalk = require('chalk')
const columnify = require('columnify')

// CHALKS
const error = chalk.redBright
const errorBright = chalk.hex('#ff6666')
const warning = chalk.yellowBright
const warningBright = chalk.hex('#e6ff8a')
const path = chalk.whiteBright.bgHex('#3c5cec')
const info = chalk.hex('#3c5cec')
const secondary = chalk.hex('#818c98')
const resultChalk = chalk.cyanBright

const logESLintResult = result => {
	const {
		filePath,
		warningCount,
		fixableWarningCount,
		errorCount,
		fixableErrorCount,
		fatalErrorCount,
	} = result

	let { messages } = result

	if (messages.length > 0) {
		console.log('')
		console.log('')
		console.log(`[${chalk.blue('ESLint')}]: ${path(filePath)}`)
		console.log('')

		messages.forEach(msg => {
			const { line, column, severity } = msg

			const msgPos = `${secondary(`:${line}:${column}`)}`
			msg.position = msgPos

			const severityArray = [`${info('ℹ')}`, `${warning('⚠')}`, `${error('✖')}`]
			msg.severity = severityArray[severity]
		})

		const columnsMessages = columnify(messages, {
			showHeaders: false,
			columnSplitter: '  ',
			config: {
				position: {
					minWidth: 8,
					align: 'right',
				},
				message: {
					maxWidth: 100,
				},
			},
			columns: ['position', 'severity', 'message'],
		})

		console.log(columnsMessages)
		console.log('')

		if (warningCount > 0)
			console.log(warningBright(`${warningCount} warnings (${fixableWarningCount} fixable)`))

		if (errorCount > 0)
			console.log(
				errorBright(
					`${errorCount} errors (${fixableErrorCount} fixable, ${fatalErrorCount} fatal)`
				)
			)

		console.log('')
		console.log('')
	}
}

const logESLintTotalResults = results => {
	console.log('')
	console.log('')

	const {
		warningCount,
		fatalErrorCount,
		fixableWarningCount,
		errorCount,
		fixableErrorCount,
		length,
	} = results

	const total = [
		{
			files: resultChalk(`${length} files`),
			warnings: warningBright(`${warningCount} warnings (${fixableWarningCount} fixable)`),
			errors: errorBright(
				`${errorCount} error (${fixableErrorCount} fixable, ${fatalErrorCount} fatal)`
			),
		},
	]

	const columnTotal = columnify(total, {
		showHeaders: false,
		columnSplitter: '  ',
		preserveNewLines: true,
		columns: ['files', 'warnings', 'errors'],
	})

	console.log(`[${chalk.blue('ESLint')}]: SUMMARY`)
	console.log('')

	console.log(columnTotal)

	console.log('')
	console.log('')
}

const lintScripts = () =>
	src([
		`${app.paths.renderer}/components/**/*.js`,
		`${app.paths.renderer}/layouts/**/*.js`,
		`${app.paths.renderer}/global/**/*.js`,
		`${app.paths.renderer}/main.js`,
	])
		.pipe(eslint({ fix: true }))
		.pipe(eslint.result(logESLintResult))
		.pipe(eslint.results(logESLintTotalResults))

module.exports = lintScripts
