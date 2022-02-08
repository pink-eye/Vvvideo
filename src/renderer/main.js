import {
	getSelector,
	hideOnScroll,
	isEmpty,
	reloadApp,
	closeApp,
	queryClosestByClass,
} from 'Global/utils'
import { AppStorage } from 'Global/AppStorage'
import { manageWin } from 'Global/WinManager'
import { checkForUpdate } from 'Global/checkForUpdate'
import { handleKeyDown } from 'Global/shortcuts'
import { openWinLatest } from 'Layouts/win-latest'
import { applySettingsOnStart } from 'Layouts/win-settings'
import {
	initSuggestions,
	hideSuggestions,
	resetSelected,
	chooseSuggestion,
	showRecentQueries,
} from 'Components/suggestions'
import { showOverlay, hideOverlay } from 'Components/overlay'
import { hideLastDropdown, startDropdowns } from 'Components/dropdown'
import { toggleMenu } from 'Components/burger'
import { showToast } from 'Components/toast'
import { initUpdateComponent } from 'Components/update'
import { handleLoadWindow } from 'Components/preloader'

window.addEventListener('load', handleLoadWindow, { once: true })

const handleFocus = () => {
	hideSuggestions()
	showOverlay()
	showRecentQueries()
}

const handleClickWindow = ({ target }) => {
	if (!target.closest('.dropdown')) {
		hideLastDropdown()
	}
	if (!target.closest('.search')) {
		hideSuggestions()
		hideOverlay()
	}
}

const handleKeyDownSearch = event => {
	const { keyCode } = event

	// ARROWS
	if (keyCode === 40 || keyCode === 38) {
		resetSelected()
		chooseSuggestion(keyCode)
	}

	// ENTER
	if (keyCode === 13) {
		hideSuggestions()
		hideOverlay()

		if (!isEmpty(event.currentTarget.value)) manageWin(event)
	}
}

const handleClickSearchBtn = event => {
	let search = queryClosestByClass(event.target, 'search')

	if (!search) return

	let searchBar = search.querySelector('.search__bar')

	if (!isEmpty(searchBar.value)) manageWin(event)

	search = null
	searchBar = null
}

document.addEventListener('DOMContentLoaded', async () => {
	const appStorage = new AppStorage()
	const storage = appStorage.get()

	if (!storage) {
		showToast('error', 'OH SHIT! I have no storage O_O')

		return
	}

	const currentAppVersion = await API.getAppVersion()
	const savedAppVersion = storage?.appVersion

	if (!savedAppVersion || currentAppVersion !== savedAppVersion) {
		const storageFromFile = await appStorage.getFromFile()

		if (storageFromFile?.appVersion === currentAppVersion) {
			appStorage.clearLocalStorage()
			storage.appVersion = currentAppVersion
			storage.settings = storageFromFile.settings
			appStorage.update(storage)

			showToast(
				'info',
				'The list of options has been updated so it has been reset. Check it out'
			)
		}
	}

	applySettingsOnStart()
	openWinLatest()
	initSuggestions()

	// MAIN SELECTORS
	const header = getSelector('.header')
	const sidebar = getSelector('.sidebar')
	let mainContent = getSelector('.main__content')

	let headerSearch = getSelector('.search')
	let searchBar = headerSearch.querySelector('.search__bar')
	let searchBtn = headerSearch.querySelector('.search__btn')

	if (storage.settings.disableSearchSuggestions) {
		searchBar.addEventListener('blur', hideOverlay)
	}

	// HIDE ON SCROLL

	hideOnScroll(header, 0)
	hideOnScroll(sidebar, 767)

	// MANAGE WINDOWS

	mainContent.addEventListener('click', manageWin)
	mainContent = null

	sidebar.addEventListener('click', manageWin)

	searchBtn.addEventListener('click', handleClickSearchBtn)
	searchBtn = null

	searchBar.addEventListener('focus', handleFocus)

	searchBar.addEventListener('keydown', handleKeyDownSearch)
	searchBar = null
	headerSearch = null

	window.addEventListener('click', handleClickWindow)

	// INIT SHORTCUTS
	document.addEventListener('keydown', handleKeyDown)

	// INIT BURGER
	let burger = header.querySelector('.burger')
	burger.addEventListener('click', toggleMenu)
	burger = null

	// INIT BTN TO RELOAD APP
	let headerReload = header.querySelector('.header__btn')
	headerReload.addEventListener('click', reloadApp)
	headerReload = null

	// INIT BTN TO CLOSE APP
	let btnExit = sidebar.querySelector('.btn-exit')
	btnExit.addEventListener('click', closeApp)
	btnExit = null

	startDropdowns()

	if (!storage.settings.checkForUpdate) {
		checkForUpdate().then(([latestVersion, currentVersion]) => {
			if (latestVersion === currentVersion) return

			initUpdateComponent()
		})
	}
})
