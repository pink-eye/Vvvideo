import { getSelector } from 'Global/utils'
import { AppStorage } from 'Global/AppStorage'
import { filterSearchResults } from 'Layouts/win-search-results/helper'
import { initPages, disablePages } from 'Components/grid-btns'
import { showToast } from 'Components/toast'
import { fillVideoCard } from 'Components/card/card-video'
import { fillPlaylistCard } from 'Components/card/card-playlist'
import { fillChannelCard } from 'Components/card/card-rich'

let lastSearchResult = null
const appStorage = new AppStorage()

export const clearRecentQueries = () => {
	let storage = appStorage.get()

	if (storage.recentQueries.length === 0) return

	storage.recentQueries.length = 0
	appStorage.update(storage)
}

const restrainRecentQueriesLength = () => {
	let storage = appStorage.get()
	const { disableRecentQueries, maxRecentQueriesLength } = storage.settings

	if (disableRecentQueries) return

	const { recentQueries } = storage

	if (recentQueries.length > maxRecentQueriesLength)
		storage.recentQueries.length = maxRecentQueriesLength

	appStorage.update(storage)
}

const saveSearchQuery = query => {
	let storage = appStorage.get()
	const { disableRecentQueries } = storage.settings

	if (disableRecentQueries) return

	let { recentQueries } = storage

	if (recentQueries.includes(query)) recentQueries = recentQueries.filter(item => item !== query)

	storage.recentQueries = [query, ...recentQueries]

	appStorage.update(storage)
}

const getSearchResultsData = query => {
	const { enableProxy, proxy } = appStorage.get().settings
	return enableProxy
		? API.scrapeSearchResultsProxy(query, proxy)
		: API.scrapeSearchResults(query, { pages: 2 })
}

export const openWinSearchResults = async () => {
	let searchBar = getSelector('.header').querySelector('.search__bar')
	let data = null

	const query = searchBar.value

	if (lastSearchResult?.originalQuery !== query) {
		try {
			document.activeElement.blur()
			saveSearchQuery(query)
			setTimeout(restrainRecentQueriesLength, 15)

			data = await getSearchResultsData(query)

			lastSearchResult = data
		} catch ({ message }) {
			showToast('error', message)
		}
	}

	let searchResults = getSelector('.search-results')

	if (searchResults.classList.contains('_active') || lastSearchResult?.originalQuery === query) {
		let cardAll = searchResults.querySelectorAll('.card')

		data ||= lastSearchResult

		let { items } = data
		const { continuation } = data

		items = filterSearchResults(items)

		items.length > cardAll.length
			? initPages(searchResults, items, cardAll, 'rich', continuation)
			: disablePages(searchResults)

		for (let index = 0, { length } = cardAll; index < length; index += 1) {
			let card = cardAll[index]
			const { type: typeCard } = items[index]

			card.dataset.win = `${typeCard}`
			card.classList.add(`_${typeCard}`)

			switch (typeCard) {
				case 'video':
					fillVideoCard(card, index, items)
					break

				case 'playlist':
					fillPlaylistCard(card, index, items)
					break

				case 'channel':
					fillChannelCard(card, index, items)
					break
			}

			card = null
		}

		cardAll = null
	}

	searchResults = null
	searchBar = null
}
