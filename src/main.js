import { getSelector, hideOnScroll, isEmpty, reloadApp } from '../js/global'
import { openWinLatest } from './layouts/win-latest/win-latest'
import { fillWinSettings, setTheme } from '../components/win-settings/win-settings'
import { initSuggests, hideSuggest, resetSelected, chooseSuggest } from './components/suggestions/suggestions'
import { showOverlay, hideOverlay } from './components/overlay/overlay'
import { manageWin } from './components/win-manager'
import { initDropdown, hideLastDropdown, startDropdowns } from './components/dropdown'
import { AppStorage } from './components/app-storage'
import { handleKeyDown } from './components/shortcuts'
import { toggleMenu } from './components/burger'


document.addEventListener('DOMContentLoaded', startDropdowns)

document.addEventListener('DOMContentLoaded', async _ => {

	// MAIN SELECTORS
	const header = getSelector('.header')
	const sidebar = getSelector('.sidebar')
	const mainContent = getSelector('.main__content')

	const headerSearch = header.querySelector('.search')
	const searchBar = headerSearch.querySelector('.search__bar')
	const searchBtn = headerSearch.querySelector('.search__btn')

	let storage = {}
	const appStorage = new AppStorage()

	const onReadStorage = async data => {
		appStorage.clearLocalStorage()
		Object.assign(storage, JSON.parse(data))
		appStorage.setStorage(storage)

		fillWinSettings()

		openWinLatest()

		initSuggests(headerSearch)

		if (storage.settings.disableSearchSuggestions) {
			searchBar.addEventListener('blur', hideOverlay)
		}
	}

	await API.readStorage(onReadStorage)

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

	searchBar.addEventListener('focus', showOverlay)

	// HOT KEYS ON SEARCH

	const handleKeyDownSearch = event => {
		// ARROWS
		if (event.keyCode === 40 || event.keyCode === 38) {
			resetSelected(headerSearch)
			chooseSuggest(headerSearch, event.keyCode)
		}

		// ENTER
		if (event.keyCode === 13) {
			hideSuggest(headerSearch)
			hideOverlay()

			if (!isEmpty(searchBar.value)) manageWin(event)
		}
	}

	searchBar.addEventListener('keydown', handleKeyDownSearch)

	const handleClickWindow = event => {
		if (!event.target.closest('.dropdown')) {
			hideLastDropdown()
		}
		if (!event.target.closest('.search')) {
			hideSuggest(headerSearch)
			hideOverlay()
		}
	}

	window.addEventListener('click', handleClickWindow)

	// INIT DROPDOWNS

	const settings = getSelector('.settings')
	const themeDropdown = settings.querySelector('.option__theme')
	const protocolDropdown = settings.querySelector('.option__protocol')
	const qualityDropdown = settings.querySelector('.option__quality')
	const formatDropdown = settings.querySelector('.option__format')

	initDropdown(themeDropdown, btn => {
		setTheme(btn.dataset.choice)
		storage.settings.theme = btn.dataset.choice
		appStorage.updateStorage(storage)
	})

	initDropdown(qualityDropdown, btn => {
		storage.settings.defaultQuality = btn.dataset.choice
		appStorage.updateStorage(storage)
	})

	initDropdown(protocolDropdown, btn => {
		storage.settings.proxy.protocol = btn.textContent.toLowerCase()
		appStorage.updateStorage(storage)
	})

	initDropdown(formatDropdown, btn => {
		storage.settings.defaltVideoFormat = btn.textContent
		appStorage.updateStorage(storage)
	})

	// INIT SHORTCUTS
	document.addEventListener('keydown', handleKeyDown)

	// INIT BURGER
	const burger = header.querySelector('.burger')
	burger.addEventListener('click', toggleMenu)

	// INIT RELOAD ON CLICK
	const headerReload = header.querySelector('.header__btn');
	headerReload.addEventListener('click', reloadApp);
})
