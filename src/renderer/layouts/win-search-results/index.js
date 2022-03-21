import cs from 'Global/CacheSelectors'
import AppStorage from 'Global/AppStorage'
import { filterSearchResults } from 'Layouts/win-search-results/helper'
import Pages from 'Components/grid-btns'
import showToast from 'Components/toast'
import suggestions from 'Components/suggestions'
import { resetGrid } from 'Components/grid'
import { fillVideoCard } from 'Components/card/card-video'
import { fillPlaylistCard } from 'Components/card/card-playlist'
import { fillChannelCard } from 'Components/card/card-rich'

const WinSearchResults = () => {
	const pages = Pages()
	const searchResults = cs.get('.search-results')
	const searchBar = cs.get('.header').querySelector('.search__bar')
	let lastSearchResult = null

	const fetchData = query => {
		if (lastSearchResult?.originalQuery === query) {
			return lastSearchResult
		}

		const appStorage = new AppStorage()
		const storage = appStorage.get()
		const { enableProxy, proxy } = storage.settings
		return enableProxy
			? API.scrapeSearchResultsProxy(query, proxy)
			: API.scrapeSearchResults(query, { pages: 2 })
	}

	const fill = data => {
		const cardAll = searchResults.querySelectorAll('.card')

		const { items, continuation } = data

		const filteredItems = filterSearchResults(items)

		if (filteredItems.length > cardAll.length) {
			pages.init({ element: searchResults, data: filteredItems, type: 'rich', continuation })
		}

		for (let index = 0, { length } = cardAll; index < length; index += 1) {
			const card = cardAll[index]
			const { type: typeCard } = filteredItems[index]

			card.dataset.win = `${typeCard}`
			card.classList.add(`_${typeCard}`)

			switch (typeCard) {
				case 'video':
					fillVideoCard(card, index, filteredItems)
					break

				case 'playlist':
					fillPlaylistCard(card, index, filteredItems)
					break

				case 'channel':
					fillChannelCard(card, index, filteredItems)
					break
			}
		}
	}

	const init = () => {
		const query = searchBar.value

		if (lastSearchResult?.originalQuery !== query) {
			document.activeElement.blur()
			suggestions.addRecentQuery(query)
			setTimeout(() => suggestions.limitRecentQueriesLength(), 15)

			fetchData(query)
				.then(data => {
					if (searchResults.classList.contains('_active')) {
						fill(data)

						if (data) lastSearchResult = data
					}
				})
				.catch(({ message }) => showToast('error', message))
		} else fill(lastSearchResult)
	}

	const reset = () => {
		resetGrid(searchResults)
		pages.reset()
	}

	return {
		init,
		reset,
	}
}

const winSearchResults = WinSearchResults()

export default winSearchResults
