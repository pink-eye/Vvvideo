import { _io_q, hideOnScroll, isEmpty } from './global'
import { openWinLatest } from './components/win-latest'
import { fillWinSettings, setTheme } from './components/win-settings'
import { initSuggests, hideSuggest, resetSelected, chooseSuggest } from './components/suggest'
import { showOverlay, hideOverlay } from './components/overlay'
import { manageWin } from './components/win-manager'
import { initDropdown, hideLastDropdown } from './components/dropdown'

let storage = {}

document.addEventListener('DOMContentLoaded', async _ => {
	// MAIN SELECTORS

	const header = _io_q('.header')
	const sidebar = _io_q('.sidebar')
	const mainContent = _io_q('.main__content')

	const headerSearch = header.querySelector('.search')
	const searchBar = headerSearch.querySelector('.search__bar')
	const searchBtn = headerSearch.querySelector('.search__btn')

	const onReadStorage = async data => {
		Object.assign(storage, JSON.parse(data))

		fillWinSettings(storage)

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

	// DROPDOWN

	const settings = _io_q('.settings')
	const themeDropdown = settings.querySelector('.option__theme')
	const protocolDropdown = settings.querySelector('.option__protocol')
	const qualityDropdown = settings.querySelector('.option__quality')
	const formatDropdown = settings.querySelector('.option__format')

	initDropdown(themeDropdown, btn => {
		setTheme(btn.dataset.choice)
		storage.settings.theme = btn.dataset.choice
		API.writeStorage(storage)
	})

	initDropdown(qualityDropdown, btn => {
		storage.settings.defaultQuality = btn.dataset.choice
		API.writeStorage(storage)
	})

	initDropdown(protocolDropdown, btn => {
		storage.settings.proxy.protocol = btn.textContent.toLowerCase()
		API.writeStorage(storage)
	})

	initDropdown(formatDropdown, btn => {
		storage.settings.defaltVideoFormat = btn.textContent
		API.writeStorage(storage)
	})
})
