import cs from 'Global/CacheSelectors'
import { isEmpty, isChild } from 'Global/utils'
import YoutubeHelper from 'Global/YoutubeHelper'
import { formatPort, setTheme, toggleTransition } from 'Layouts/win-settings/helper'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import { clearHistory, disableHistory } from 'Layouts/win-history/helper'
import { clearRecentQueries } from 'Layouts/win-search-results'
import Dropdown from 'Components/dropdown'
import DragNDrop from 'Components/drag-n-drop'

const appStorage = new AppStorage()
const dragNDrop = new DragNDrop()
let dropdownTheme = null
let dropdownQuality = null
let dropdownFormat = null
let dropdownProtocol = null
let storage = null
let isFilledWin = false

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

const handleInputField = event => {
	storage = appStorage.get()
	let input = event.target
	const option = input.id

	switch (option) {
		case 'host':
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
			if (checkbox.checked) cs.get('.main__content').style.setProperty('--margin', '0')
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

	target = null
}

const handleChangeWin = event => {
	let { target } = event

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
	let settings = cs.get('.settings')

	fillWinSettings()

	dropdownTheme.init()
	dropdownProtocol.init()
	dropdownQuality.init()
	dropdownFormat.init()

	dragNDrop.init({
		afterReadFile: data => {
			buildStorage(data)
			appStorage.update(storage)
		},
	})

	settings.addEventListener('click', handleClickWin)
	settings.addEventListener('change', handleChangeWin)
	settings.addEventListener('input', handleInputWin)

	settings = null
}

export const resetWinSettings = () => {
	let settings = cs.get('.settings')

	dropdownTheme.reset()
	dropdownQuality.reset()
	dropdownFormat.reset()
	dropdownProtocol.reset()

	dragNDrop.reset()

	settings.removeEventListener('click', handleClickWin)
	settings.removeEventListener('change', handleChangeWin)
	settings.removeEventListener('input', handleInputWin)

	settings = null
}

export const applySettingsOnStart = () => {
	storage = appStorage.get()
	const { settings } = storage

	setTheme(settings.theme)

	if (settings.disableTransition) toggleTransition(settings.disableTransition)

	if (settings.disableHistory) disableHistory()
}

const fillWinSettings = () => {
	if (isFilledWin) return

	isFilledWin = true

	storage = appStorage.get()
	const { settings: ss } = storage
	let settings = cs.get('.settings')

	const settingsArray = Object.entries(ss)

	settingsArray.forEach(([key, value]) => {
		let checkbox = settings.querySelector(`input#${key}`)

		if (checkbox) checkbox.checked = value

		checkbox = null
	})

	// INIT DROPDOWNS

	let dropdownThemeEl = settings.querySelector('[data-dropdown="theme"]')
	let dropdownProtocolEl = settings.querySelector('[data-dropdown="protocol"]')
	let dropdownQualityEl = settings.querySelector('[data-dropdown="quality"]')
	let dropdownFormatEl = settings.querySelector('[data-dropdown="format"]')

	const dropdownFormatInitialHead = ss.defaultVideoFormat
	const dropdownProtocolInitialHead = ss.proxy.protocol
	const dropdownThemeInitialHead =
		ss.theme === 'system' ? 'System default' : ss.theme === 'light' ? 'Light' : 'Dark'
	const dropdownQualityInitialHead =
		ss.defaultQuality === 'highest' ? 'Highest' : ss.defaultQuality

	dropdownTheme = new Dropdown({
		onClick: btn => {
			setTheme(btn.dataset.choice)
			storage.settings.theme = btn.dataset.choice
			appStorage.update(storage)
		},
		head: dropdownThemeInitialHead,
		element: dropdownThemeEl,
	})
	dropdownProtocol = new Dropdown({
		onClick: btn => {
			storage.settings.proxy.protocol = btn.textContent.toLowerCase()
			appStorage.update(storage)
		},
		head: dropdownProtocolInitialHead,
		element: dropdownProtocolEl,
	})
	dropdownQuality = new Dropdown({
		onClick: btn => {
			storage.settings.defaultQuality = btn.dataset.choice
			appStorage.update(storage)
		},
		head: dropdownQualityInitialHead,
		element: dropdownQualityEl,
	})
	dropdownFormat = new Dropdown({
		onClick: btn => {
			storage.settings.defaultVideoFormat = btn.textContent
			appStorage.update(storage)
		},
		head: dropdownFormatInitialHead,
		element: dropdownFormatEl,
	})

	dropdownQualityEl = null
	dropdownFormatEl = null
	dropdownThemeEl = null
	dropdownProtocolEl = null

	// FILL INPUTS
	let inputHost = settings.querySelector('input#host')
	let inputPort = settings.querySelector('input#port')

	inputHost.value = ss.proxy.host
	inputPort.value = ss.proxy.port

	inputHost = null
	inputPort = null

	if (ss.regionTrending !== 'US') {
		let inputRegionTrending = settings.querySelector('input#regionTrending')

		inputRegionTrending.value = ss.regionTrending

		inputRegionTrending = null
	}

	settings = null
}
