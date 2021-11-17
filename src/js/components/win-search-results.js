let lastSearchResult = null

const openWinSearchResults = async _ => {
	let searchResults = _io_q('.search-results')
	let searchBar = _io_q('.header').querySelector('.search__bar')
	let cardAll = searchResults.querySelectorAll('.card')

	try {
		let data = null

		if (lastSearchResult?.originalQuery !== searchBar.value) {
			data = storage.settings.enableProxy
				? await API.scrapeSearchResultsProxy(searchBar.value, getProxyOptions())
				: await API.scrapeSearchResults(searchBar.value)

			lastSearchResult = data
		}

		data ||= lastSearchResult

		let { items, continuation } = data

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

