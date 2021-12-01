import { getSelector } from 'Global/utils'
import { AppStorage } from 'Global/app-storage'
import { filterSearchResults } from 'Layouts/win-search-results/helper'
import { initPages, disablePages } from 'Components/grid-btns'
import { showToast } from 'Components/toast'
import { fillVideoCard } from 'Components/card/card-video'
import { fillPlaylistCard } from 'Components/card/card-playlist'
import { fillChannelCard } from 'Components/card/card-rich'

let lastSearchResult = null
const appStorage = new AppStorage()

export const clearRecentQueries = () => {
	let storage = appStorage.getStorage()

	if (storage.recentQueries.length === 0) return

	storage.recentQueries.length = 0
	appStorage.updateStorage(storage)
}

const restrainRecentQueriesLength = _ => {
	let storage = appStorage.getStorage()
	const { disableRecentQueries, maxRecentQueriesLength } = storage.settings

	if (disableRecentQueries) return

	const { recentQueries } = storage

	if (recentQueries.length > maxRecentQueriesLength) storage.recentQueries.length = maxRecentQueriesLength

	appStorage.updateStorage(storage)
}

const saveSearchQuery = query => {
	let storage = appStorage.getStorage()
	const { disableRecentQueries } = storage.settings

	if (disableRecentQueries) return

	let { recentQueries } = storage

	if (recentQueries.includes(query)) recentQueries = recentQueries.filter(item => item !== query)

	storage.recentQueries = [query, ...recentQueries]

	appStorage.updateStorage(storage)
}

export const openWinSearchResults = async _ => {
	let searchResults = getSelector('.search-results')
	let searchBar = getSelector('.header').querySelector('.search__bar')
	let cardAll = searchResults.querySelectorAll('.card')

	try {
		let data = null

		const { enableProxy, proxy } = appStorage.getStorage().settings
		const query = searchBar.value

		if (lastSearchResult?.originalQuery !== query) {
			saveSearchQuery(query)
			setTimeout(restrainRecentQueriesLength, 30)

			data = enableProxy ? await API.scrapeSearchResultsProxy(query, proxy) : await API.scrapeSearchResults(query)

			lastSearchResult = data
		}

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
		}
	} catch (error) {
		showToast('error', error.message)
	} finally {
		searchResults = null
		searchBar = null
		cardAll = null
	}
}
