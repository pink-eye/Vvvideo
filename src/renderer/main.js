import { getSelector, hideOnScroll, isEmpty, reloadApp, closeApp } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'
import { manageWin } from 'Global/win-manager'
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

document.addEventListener('DOMContentLoaded', startDropdowns)

document.addEventListener('DOMContentLoaded', () => {
	const appStorage = new AppStorage()
	const storage = appStorage.get()

	if (!storage) {
		showToast('error', 'OH SHIT! I have no storage O_O')

		return
	}

	applySettingsOnStart()
	openWinLatest()
	initSuggestions()

	// MAIN SELECTORS
	const header = getSelector('.header')
	const sidebar = getSelector('.sidebar')
	const mainContent = getSelector('.main__content')

	const headerSearch = getSelector('.search')
	const searchBar = headerSearch.querySelector('.search__bar')
	const searchBtn = headerSearch.querySelector('.search__btn')

	if (storage.settings.disableSearchSuggestions) {
		searchBar.addEventListener('blur', hideOverlay)
	}

	// HIDE ON SCROLL

	hideOnScroll(header, 0)
	hideOnScroll(sidebar, 767)

	// MANAGE WINDOWS

	mainContent.addEventListener('click', manageWin)

	sidebar.addEventListener('click', manageWin)

	const handleClickSearch = event => {
		if (!isEmpty(searchBar.value)) manageWin(event)
	}

	searchBtn.addEventListener('click', handleClickSearch)

	searchBar.addEventListener('focus', handleFocus)

	// HOT KEYS ON SEARCH

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

			if (!isEmpty(searchBar.value)) manageWin(event)
		}
	}

	searchBar.addEventListener('keydown', handleKeyDownSearch)

	window.addEventListener('click', handleClickWindow)

	// INIT SHORTCUTS
	document.addEventListener('keydown', handleKeyDown)

	// INIT BURGER
	const burger = header.querySelector('.burger')
	burger.addEventListener('click', toggleMenu)

	// INIT BTN TO RELOAD APP
	const headerReload = header.querySelector('.header__btn')
	headerReload.addEventListener('click', reloadApp)

	// INIT BTN TO CLOSE APP
	const btnExit = sidebar.querySelector('.btn-exit')
	btnExit.addEventListener('click', closeApp)
})
