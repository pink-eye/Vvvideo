import cs from 'Global/CacheSelectors'
import { isEmpty, hasFocus, queryClosestByClass } from 'Global/utils'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import { createRecentQueryHTML, createSuggestionHTML } from './helper'
import manageWin from 'Global/WinManager'
import overlay from 'Components/overlay'

const appStorage = new AppStorage()

const Suggestions = () => {
	let lastSelected = null
	let suggestionListLength = 0

	const headerSearch = cs.get('.search')
	const suggestionList = headerSearch.querySelector('.suggestion__list')
	const searchBar = headerSearch.querySelector('.search__bar')

	const addSuggestion = (data, isRecent) => {
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
	}

	const resetSelected = () => {
		let selectedSuggestion = headerSearch.querySelector('._selected')

		if (selectedSuggestion) {
			selectedSuggestion.classList.remove('_selected')

			selectedSuggestion = null
		}
	}

	const selectSuggestion = direction => {
		let suggestionAll = headerSearch.querySelectorAll('.suggestion')

		if (suggestionAll.length) {
			if (lastSelected !== null) {
				const isArrowDown = direction === 40
				const index = isArrowDown ? lastSelected + 1 : lastSelected - 1
				const sparedIndex = isArrowDown ? 0 : suggestionAll.length - 1
				let requiredSuggestion = suggestionAll[index] ?? suggestionAll[sparedIndex]

				requiredSuggestion.classList.add('_selected')
				lastSelected = suggestionAll[index] ? index : sparedIndex

				requiredSuggestion = null
			} else {
				let firstSuggestion = suggestionAll[0]

				firstSuggestion.classList.add('_selected')
				lastSelected = 0

				firstSuggestion = null
			}

			let selectedSuggestion = headerSearch.querySelector('._selected')

			if (selectedSuggestion) {
				searchBar.value = selectedSuggestion.textContent.trim()

				selectedSuggestion = null
			}
		}

		suggestionAll = null
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
		overlay.show()

		const { enableProxy, proxy, dontShowRecentQueriesOnTyping } = appStorage.get().settings

		suggestionListLength = 0
		const query = currentTarget.value.trim()

		if (query.length) {
			let suggestions = null

			try {
				suggestions = enableProxy
					? await API.scrapeSuggestsProxy(query, proxy)
					: await API.scrapeSuggests(query)
			} catch ({ message }) {
				showToast('error', message)
			}

			hide()

			if (!dontShowRecentQueriesOnTyping) {
				const relevantRecentQueries = getRelevantRecentQueries(query)

				if (relevantRecentQueries?.length) addSuggestion(relevantRecentQueries, true)
			}

			if (suggestions?.length) addSuggestion(suggestions, false)
		} else {
			hide()
			overlay.hide()
		}
	}

	const handleKeyDown = event => {
		const { keyCode } = event

		// ARROWS
		if (keyCode === 40 || keyCode === 38) {
			resetSelected()
			selectSuggestion(keyCode)
		}

		// ENTER
		if (keyCode === 13) {
			hide()
			overlay.hide()

			const searchBarValue = event.currentTarget.value

			if (!isEmpty(searchBarValue)) {
				manageWin(event)
			} else {
				showToast('info', 'The search field is empty')
			}
		}
	}

	const handleFocus = ({ currentTarget }) => {
		hide()
		overlay.show()
		showRecentQueries()

		currentTarget.addEventListener('keydown', handleKeyDown)
		currentTarget.addEventListener('input', handleInput)
	}

	const handleBlur = ({ currentTarget }) => {
		currentTarget.removeEventListener('keydown', handleKeyDown)
		currentTarget.removeEventListener('input', handleInput)
	}

	const init = () => {
		const { settings } = appStorage.get()

		if (settings.disableSearchSuggestions) {
			searchBar.addEventListener('blur', overlay.hide)
			return
		}

		const handleClickSuggestion = ({ target }) => {
			let suggestion = queryClosestByClass(target, 'suggestion')

			if (!suggestion) return

			resetSelected()
			searchBar.value = suggestion.textContent.trim()
			searchBar.focus()

			suggestion = null
		}

		suggestionList.addEventListener('click', handleClickSuggestion)
		searchBar.addEventListener('focus', handleFocus)
		searchBar.addEventListener('blur', handleBlur)
	}

	const hide = () => {
		resetSelected()
		suggestionListLength = 0

		while (suggestionList.firstChild) {
			suggestionList.firstChild.remove()
		}
	}

	return {
		init,
		hide,
	}
}

const suggestions = Suggestions()

export default suggestions
