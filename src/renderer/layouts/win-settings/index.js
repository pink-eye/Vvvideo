import { getSelector, isEmpty, reloadApp, isChild } from 'Global/utils'
import { YoutubeHelper } from 'Global/YoutubeHelper'
import { formatIP, formatPort } from 'Layouts/win-settings/helper'
import { AppStorage } from 'Global/AppStorage'
import { showToast } from 'Components/toast'
import { clearHistory, disableHistory } from 'Layouts/win-history/helper'
import { clearRecentQueries } from 'Layouts/win-search-results'
import { initDropdown } from 'Components/dropdown'

const appStorage = new AppStorage()
let storage = null
let isFilledWin = false

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

const readInputFile = () => {
	const validTip = 'Successfully! Wait for refresh...'
	const failTip = 'Fail... :('

	let settings = getSelector('.settings')
	let impExpField = settings.querySelector('.imp-exp__field')

	const reader = new FileReader()
	reader.readAsText(impExpField.files[0])

	const onLoadReader = () => {
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

const handleClickImport = () => {
	const invalidTip = "I've not found a JSON file.\n Ensure you interacted this area"
	let settings = getSelector('.settings')
	let impExpField = settings.querySelector('.imp-exp__field')

	impExpField.value === '' || /\.(json)$/i.test(impExpField.files[0].name) === false
		? makeResultImport('_invalid', invalidTip)
		: readInputFile()

	settings = null
	impExpField = null
}

const handleFile = event => {
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
	let input = event.target
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

	input = null

	appStorage.update(storage)
}

const toggleTransition = isDisabled => {
	let modalContainer = document.querySelector('.modal__container')

	if (isDisabled) {
		document.documentElement.style.setProperty('--trns-time-default', '0s')
		document.documentElement.style.setProperty('--trns-time-fast', '0')
		document.documentElement.style.setProperty('--trns-time-slow', '0')
		document.documentElement.style.setProperty('--trns-timing-func', 'unset')
		modalContainer.dataset.graphSpeed = 0
	} else {
		document.documentElement.removeAttribute('style')
		modalContainer.dataset.graphSpeed = 300
	}

	modalContainer = null
}

const handleChangeCheckbox = event => {
	storage = appStorage.get()
	let checkbox = event.target
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

	checkbox = null

	appStorage.update(storage)
}

const handleClickWin = event => {
	let { target } = event

	if (isChild(target, '.clear-history')) {
		clearHistory()
	}

	if (isChild(target, '.imp-exp__btn.btn-accent')) {
		handleClickImport()
	}

	target = null
}

const handleChangeWin = event => {
	let { target } = event

	if (target.matches('input[type="file"]')) {
		handleFile(event)
	}

	if (target.matches('input[type="checkbox"]')) {
		handleChangeCheckbox(event)
	}

	target = null
}

const handleInputWin = event => {
	let { target } = event

	if (target.matches('input[type="text"]')) {
		handleInputField(event)
	}

	target = null
}

export const openWinSettings = () => {
	let settings = getSelector('.settings')

	fillWinSettings()

	settings.addEventListener('click', handleClickWin)
	settings.addEventListener('change', handleChangeWin)
	settings.addEventListener('input', handleInputWin)

	settings = null
}

export const resetWinSettings = () => {
	let settings = getSelector('.settings')

	settings.removeEventListener('click', handleClickWin)
	settings.removeEventListener('change', handleChangeWin)
	settings.removeEventListener('input', handleInputWin)

	settings = null
}

export const setTheme = themeOption => {
	if (themeOption === 'light') theme.setMode('light')
	if (themeOption === 'dark') theme.setMode('dark')
	if (themeOption === 'system') theme.setMode(theme.getSystemScheme())
}

export const applySettingsOnStart = () => {
	storage = appStorage.get()
	const { settings } = storage

	setTheme(settings.theme)

	if (settings.disableTransition) toggleTransition(settings.disableTransition)

	if (settings.disableHistory) disableHistory()
}

export const fillWinSettings = () => {
	if (isFilledWin) return

	isFilledWin = true

	storage = appStorage.get()
	const { settings: ss } = storage
	const settings = getSelector('.settings')

	let themeDropdown = settings.querySelector('.option__theme')
	let themeDropdownHead = themeDropdown.querySelector('.dropdown__head')

	themeDropdownHead.childNodes[0].data =
		ss.theme === 'system' ? 'System default' : ss.theme === 'light' ? 'Light' : 'Dark'

	initDropdown(themeDropdown, btn => {
		setTheme(btn.dataset.choice)
		storage.settings.theme = btn.dataset.choice
		appStorage.update(storage)
	})

	themeDropdown = null
	themeDropdownHead = null

	const settingsArray = Object.entries(ss)

	for (const [key, value] of settingsArray) {
		let checkbox = settings.querySelector(`input#${key}`)

		if (checkbox) checkbox.checked = value

		checkbox = null
	}

	if (ss.defaultQuality !== '1080p') {
		let qualityDropdown = settings.querySelector('.option__quality')
		let qualityDropdownHead = qualityDropdown.querySelector('.dropdown__head')

		qualityDropdownHead.childNodes[0].data =
			ss.defaultQuality === 'highest' ? 'Highest' : ss.defaultQuality

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

	// INIT DROPDOWNS

	const protocolDropdown = settings.querySelector('.option__protocol')
	const qualityDropdown = settings.querySelector('.option__quality')
	const formatDropdown = settings.querySelector('.option__format')

	initDropdown(qualityDropdown, btn => {
		storage.settings.defaultQuality = btn.dataset.choice
		appStorage.update(storage)
	})

	initDropdown(protocolDropdown, btn => {
		storage.settings.proxy.protocol = btn.textContent.toLowerCase()
		appStorage.update(storage)
	})

	initDropdown(formatDropdown, btn => {
		storage.settings.defaultVideoFormat = btn.textContent
		appStorage.update(storage)
	})
}
