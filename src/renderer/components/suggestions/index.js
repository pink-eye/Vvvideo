import cs from 'Global/CacheSelectors'
import { isEmpty, hasFocus, queryClosestByClass } from 'Global/utils'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import manageWin from 'Global/WinManager'
import { showOverlay, hideOverlay } from 'Components/overlay'

let lastSelected = null
let suggestionListLength = 0
const appStorage = new AppStorage()

const createSuggestionHTML = textContent => `<button class="suggestion">
											<aside class="suggestion__icon">
												<svg width="21px" height="21px">
													<use xlink:href='img/svg/actions.svg#search'></use>
												</svg>
											</aside>
											<span class="suggestion__text">${textContent}</span>
										</button>`

const createRecentQueryHTML = textContent => `<button class="suggestion">
											<aside class="suggestion__icon">
												<svg width="18px" height="18px">
													<use xlink:href='img/svg/actions.svg#date'></use>
												</svg>
											</aside>
											<span class="suggestion__text">${textContent}</span>
										</button>`

const addSuggestion = (data, isRecent) => {
	let headerSearch = cs.get('.search')
	let suggestionList = headerSearch.querySelector('.suggestion__list')
	let searchBar = headerSearch.querySelector('.search__bar')

	lastSelected = null

	for (let index = 0; index < 10; index += 1) {
		const query = searchBar.value.trim()

		if (suggestionListLength > 9) return

		if (!isEmpty(data[index]) && hasFocus(searchBar)) {
			let newItem = null

			if (query.length === 0) {
				if (isRecent) newItem = createRecentQueryHTML(data[index])
				else break
			} else {
				newItem = isRecent
					? createRecentQueryHTML(data[index])
					: createSuggestionHTML(data[index])
			}

			suggestionListLength += 1
			suggestionList.insertAdjacentHTML('beforeEnd', newItem)
		} else break
	}

	suggestionList = null
	searchBar = null
	headerSearch = null
}

const resetSelected = () => {
	let headerSearch = cs.get('.search')
	let selectedSuggestion = headerSearch.querySelector('._selected')

	if (selectedSuggestion) selectedSuggestion.classList.remove('_selected')

	selectedSuggestion = null
	headerSearch = null
}

const hideSuggestions = () => {
	resetSelected()

	let headerSearch = cs.get('.search')
	let suggestionList = headerSearch.querySelector('.suggestion__list')

	suggestionListLength = 0

	while (suggestionList.firstChild) suggestionList.firstChild.remove()

	suggestionList = null
	headerSearch = null
}

const insertSelectedSuggestion = suggestion => {
	let headerSearch = cs.get('.search')
	let searchBar = headerSearch.querySelector('.search__bar')
	let suggestionText = suggestion.querySelector('.suggestion__text')

	if (searchBar) searchBar.value = suggestionText.textContent

	searchBar = null
	suggestionText = null
	headerSearch = null
}

const chooseSuggestion = direction => {
	let headerSearch = cs.get('.search')
	let suggestionAll = headerSearch.querySelectorAll('.suggestion')

	if (suggestionAll.length > 0) {
		if (lastSelected !== null) {
			const index = direction === 40 ? lastSelected + 1 : lastSelected - 1
			const sparedIndex = direction === 40 ? 0 : suggestionAll.length - 1
			let nextSelect = suggestionAll[index] ?? suggestionAll[sparedIndex]

			nextSelect.classList.add('_selected')
			lastSelected = suggestionAll[index] ? index : sparedIndex

			nextSelect = null
		} else {
			suggestionAll[0].classList.add('_selected')
			lastSelected = 0
		}

		let selectedSuggest = headerSearch.querySelector('._selected')

		if (selectedSuggest) insertSelectedSuggestion(selectedSuggest)

		selectedSuggest = null
	}

	suggestionAll = null
	headerSearch = null
}

const getRelevantRecentQueries = query => {
	const { recentQueries } = appStorage.get()

	if (recentQueries.length === 0) return undefined

	return recentQueries.filter(item => item.includes(query))
}

const showRecentQueries = () => {
	const { recentQueries } = appStorage.get()

	if (recentQueries.length === 0) return

	addSuggestion(recentQueries, true)
}

const handleInput = async ({ currentTarget }) => {
	showOverlay()

	const { enableProxy, proxy, dontShowRecentQueriesOnTyping } = appStorage.get().settings

	suggestionListLength = 0
	let query = currentTarget.value.trim()

	if (query.length > 0) {
		let suggestions = null

		try {
			suggestions = enableProxy
				? await API.scrapeSuggestsProxy(query, proxy)
				: await API.scrapeSuggests(query)
		} catch ({ message }) {
			showToast('error', message)
		}

		hideSuggestions()

		if (!dontShowRecentQueriesOnTyping) {
			const relevantRecentQueries = getRelevantRecentQueries(query)

			if (relevantRecentQueries?.length > 0) addSuggestion(relevantRecentQueries, true)
		}

		if (suggestions?.length > 0) addSuggestion(suggestions, false)
	} else {
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
		else showToast('info', 'The search field is empty')
	}
}

const handleFocus = ({ currentTarget }) => {
	hideSuggestions()
	showOverlay()
	showRecentQueries()

	currentTarget.addEventListener('keydown', handleKeyDownSearch)
	currentTarget.addEventListener('input', handleInput)
}

const handleBlur = ({ currentTarget }) => {
	currentTarget.removeEventListener('keydown', handleKeyDownSearch)
	currentTarget.removeEventListener('input', handleInput)
}

const initSuggestions = () => {
	const { settings } = appStorage.get()

	let headerSearch = cs.get('.search')
	let searchBar = headerSearch.querySelector('.search__bar')

	if (settings.disableSearchSuggestions) {
		searchBar.addEventListener('blur', hideOverlay)

		headerSearch = null
		searchBar = null
		return
	}

	let suggestionList = headerSearch.querySelector('.suggestion__list')

	const handleClickSuggestion = ({ target }) => {
		let suggestion = queryClosestByClass(target, 'suggestion')

		if (!suggestion) return

		insertSelectedSuggestion(suggestion)
		resetSelected()
		searchBar.focus()

		suggestion = null
	}

	suggestionList.addEventListener('click', handleClickSuggestion)
	suggestionList = null

	searchBar.addEventListener('focus', handleFocus)
	searchBar.addEventListener('blur', handleBlur)
	headerSearch = null
	searchBar = null
}

export { initSuggestions, hideSuggestions }
