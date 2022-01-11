import { getSelector, isEmpty, reloadApp } from 'Global/utils'
import { YoutubeHelper } from 'Global/youtube-helper'
import { formatIP, formatPort } from 'Layouts/win-settings/helper'
import { AppStorage } from 'Global/app-storage'
import { showToast } from 'Components/toast'
import { clearHistory, disableHistory } from 'Layouts/win-history/helper'
import { clearRecentQueries } from 'Layouts/win-search-results'

const appStorage = new AppStorage()
let storage = null

const makeResultImport = (classResult, tip) => {
	let settings = getSelector('.settings')
	let impExpBody = settings.querySelector('.imp-exp')
	let impExpTip = settings.querySelector('.imp-exp__tip')

	if (!impExpBody.classList.contains(classResult)) {
		impExpBody.classList.add(classResult)
		impExpTip.textContent = tip
	}

	settings = null
	impExpBody = null
	impExpTip = null
}

const buildStorage = data => {
	if (data?.subscriptions) {
		const { subscriptions } = data

		if (subscriptions.length > 0) {
			const { channelId, name: author } = subscriptions[0]

			if (channelId && author) {
				storage.subscriptions = subscriptions
			} else {
				const yh = new YoutubeHelper()

				for (let index = 0, { length } = subscriptions; index < length; index += 1) {
					const subscription = subscriptions[index]
					const { url, name } = subscription

					storage.subscriptions.push({
						channelId: yh.getChannelId(url),
						name,
					})
				}
			}
		}
	}

	if (data?.history) {
		const { history } = data

		if (history.length > 0) storage.history = history
	}

	if (data?.recentQueries) {
		const { recentQueries } = data

		if (recentQueries.length > 0) storage.recentQueries = recentQueries
	}

	if (data?.settings) {
		storage.settings = {}
		Object.assign(storage.settings, data.settings)
	}
}

const readInputFile = _ => {
	const validTip = 'Successfully! Wait for refresh...'
	const failTip = 'Fail... :('

	let settings = getSelector('.settings')
	let impExpField = settings.querySelector('.imp-exp__field')

	const reader = new FileReader()
	reader.readAsText(impExpField.files[0])

	const onLoadReader = _ => {
		const data = JSON.parse(reader.result)

		if (!data?.subscriptions) makeResultImport('_invalid', failTip)
		else {
			buildStorage(data)
			makeResultImport('_valid', validTip)
			appStorage.update(storage)
			setTimeout(reloadApp, 3000)
		}
	}

	reader.addEventListener('load', onLoadReader, { once: true })

	settings = null
	impExpField = null
}

const handleClickImport = _ => {
	const invalidTip = "I've not found a JSON file.\n Ensure you interacted this area"
	let settings = getSelector('.settings')
	let impExpField = settings.querySelector('.imp-exp__field')

	impExpField.value === '' || /\.(json)$/i.test(impExpField.files[0].name) === false
		? makeResultImport('_invalid', invalidTip)
		: readInputFile()

	settings = null
	impExpField = null
}

const handleFile = _ => {
	let settings = getSelector('.settings')
	let impExpBody = settings.querySelector('.imp-exp')
	let impExpTip = settings.querySelector('.imp-exp__tip')
	let impExpField = settings.querySelector('.imp-exp__field')

	impExpBody.classList.remove('_valid')
	impExpBody.classList.remove('_invalid')
	impExpTip.textContent = `I've got a '${impExpField.files[0].name}'. You can press 'Import' now`

	settings = null
	impExpBody = null
	impExpTip = null
	impExpField = null
}

const handleInputField = event => {
	storage = appStorage.get()
	const input = event.currentTarget
	const option = input.id

	switch (option) {
		case 'host':
			input.value = formatIP(input.value)
			storage.settings.proxy.host = isEmpty(input.value) ? '127.0.0.1' : input.value
			break

		case 'port':
			input.value = formatPort(input.value)
			storage.settings.proxy.port = isEmpty(input.value) ? 9050 : +input.value
			break

		case 'regionTrending':
			storage.settings.regionTrending = isEmpty(input.value) ? 'US' : input.value
			break

		case 'maxHistoryLength':
			storage.settings.maxHistoryLength = isEmpty(input.value) ? 30 : +input.value
			break

		case 'maxRecentQueriesLength':
			storage.settings.maxRecentQueriesLength = isEmpty(input.value) ? 10 : +input.value
			break
	}

	appStorage.update(storage)
}

const toggleTransition = isDisabled => {
	let modalContainer = document.querySelector('.modal__container')

	if (isDisabled) {
		document.documentElement.style.setProperty('--trns-time-default', '0')
		document.documentElement.style.setProperty('--trns-time-fast', '0')
		document.documentElement.style.setProperty('--trns-time-slow', '0')
		modalContainer.dataset.graphSpeed = 0
	} else {
		document.documentElement.style.setProperty('--trns-time-default', '.3s')
		document.documentElement.style.setProperty('--trns-time-fast', '.1s')
		document.documentElement.style.setProperty('--trns-time-slow', '1s')
		modalContainer.dataset.graphSpeed = 300
	}

	modalContainer = null
}

const handleChangeCheckbox = event => {
	storage = appStorage.get()
	const checkbox = event.currentTarget
	const option = checkbox.id

	storage.settings[`${option}`] = checkbox.checked

	switch (option) {
		case 'disableTransition':
			toggleTransition(checkbox.checked)
			break

		case 'disableRecentQueries':
			clearRecentQueries()
			showToast('info', 'Restart app')
			break

		case 'enableProxy':
			checkbox.checked
				? showToast('info', 'Restart app after the fields is filled in')
				: showToast('info', 'Restart app')
			break

		case 'notAdaptContent':
			if (checkbox.checked) getSelector('.main__content').style.setProperty('--margin', '0')
			break

		case 'disableSearchSuggestions':
		case 'dontShowRecentQueriesOnTyping':
		case 'disableStoryboard':
		case 'disableHistory':
			showToast('info', 'Refresh app')
			break
	}

	appStorage.update(storage)
}

export const openWinSettings = _ => {
	const settings = getSelector('.settings')

	// IMPLEMENT IMPORT

	const impExpBtn = settings.querySelector('.imp-exp__btn.btn-accent')
	const impExpField = settings.querySelector('.imp-exp__field')

	impExpField.addEventListener('change', handleFile)

	impExpBtn.addEventListener('click', handleClickImport)

	// CHECKBOXES

	const checkboxAll = settings.querySelectorAll('input[type="checkbox"]')

	for (let index = 0, { length } = checkboxAll; index < length; index += 1) {
		const checkbox = checkboxAll[index]

		checkbox.addEventListener('change', handleChangeCheckbox)
	}

	// INPUTS

	const inputAll = settings.querySelectorAll('input[type="text"]')

	for (let index = 0, { length } = inputAll; index < length; index += 1) {
		const input = inputAll[index]

		input.addEventListener('input', handleInputField)
	}
}

export const resetWinSettings = _ => {
	let settings = getSelector('.settings')

	// RESET IMPORT

	let impExpBtn = settings.querySelector('.imp-exp__btn.btn-accent')
	let impExpField = settings.querySelector('.imp-exp__field')

	impExpField.removeEventListener('change', handleFile)
	impExpBtn.removeEventListener('click', handleClickImport)

	// RESET CHECKBOXES

	let checkboxAll = settings.querySelectorAll('input[type="checkbox"]')

	for (let index = 0, { length } = checkboxAll; index < length; index += 1) {
		const checkbox = checkboxAll[index]

		checkbox.removeEventListener('change', handleChangeCheckbox)
	}

	// RESET INPUTS

	let inputAll = settings.querySelectorAll('input[type="text"]')

	for (let index = 0, { length } = inputAll; index < length; index += 1) {
		const input = inputAll[index]

		input.removeEventListener('input', handleInputField)
	}

	settings = null
	checkboxAll = null
	inputAll = null
	impExpBtn = null
	impExpField = null
}

export const setTheme = themeOption => {
	if (themeOption === 'light') theme.setMode('light')
	if (themeOption === 'dark') theme.setMode('dark')
	if (themeOption === 'system') theme.setMode(theme.getSystemScheme())
}

export const fillWinSettings = _ => {
	storage = appStorage.get()
	const { settings: ss } = storage
	const settings = getSelector('.settings')
	const btnClearHistory = settings.querySelector('#clear-history')

	btnClearHistory.addEventListener('click', clearHistory)

	let themeDropdown = settings.querySelector('.option__theme')
	let themeDropdownHead = themeDropdown.querySelector('.dropdown__head')

	themeDropdownHead.childNodes[0].data =
		ss.theme === 'system' ? 'System default' : ss.theme === 'light' ? 'Light' : 'Dark'

	setTheme(ss.theme)

	const settingsArray = Object.entries(ss)

	for (const [key, value] of settingsArray) {
		let checkbox = settings.querySelector(`input#${key}`)

		if (checkbox) checkbox.checked = value

		checkbox = null
	}

	if (ss.disableTransition) toggleTransition(ss.disableTransition)

	if (ss.disableHistory) disableHistory()

	if (ss.defaultQuality !== '1080p') {
		let qualityDropdown = settings.querySelector('.option__quality')
		let qualityDropdownHead = qualityDropdown.querySelector('.dropdown__head')

		qualityDropdownHead.childNodes[0].data = ss.defaultQuality === 'highest' ? 'Highest' : ss.defaultQuality

		qualityDropdown = null
		qualityDropdownHead = null
	}

	if (ss.defaultVideoFormat !== 'mp4') {
		let formatDropdown = settings.querySelector('.option__format')
		let formatDropdownHead = formatDropdown.querySelector('.dropdown__head')

		formatDropdownHead.childNodes[0].data = ss.defaultVideoFormat

		formatDropdown = null
		formatDropdownHead = null
	}

	if (ss.proxy.protocol !== 'socks5' && ss.proxy.host !== '127.0.0.1' && ss.proxy.port !== 9050) {
		let protocolDropdown = settings.querySelector('.option__protocol')
		let protocolDropdownHead = protocolDropdown.querySelector('.dropdown__head')

		protocolDropdownHead.textContent = ss.proxy.protocol

		let inputHost = settings.querySelector('input#host')
		let inputPort = settings.querySelector('input#port')

		inputHost.value = ss.proxy.host
		inputPort.value = ss.proxy.port

		protocolDropdown = null
		protocolDropdownHead = null
		inputHost = null
		inputPort = null
	}

	if (ss.regionTrending !== 'US') {
		let inputRegionTrending = settings.querySelector('input#regionTrending')

		inputRegionTrending.value = ss.regionTrending

		inputRegionTrending = null
	}

	themeDropdown = null
	themeDropdownHead = null
}
