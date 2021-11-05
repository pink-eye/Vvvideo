const openWinSearchResults = async _ => {
	let searchResults = _io_q('.search-results')
	let searchBar = _io_q('.header').querySelector('.search__bar');
	let cardAll = searchResults.querySelectorAll('.card');

	try {
		let data = storage.settings.enableProxy
			? await API.scrapeSearchResultsProxy(searchBar.value, getProxyOptions())
			: await API.scrapeSearchResults(searchBar.value)

		let { items, continuation } = data

		items = filterSearchResults(items)

		items.length > cardAll.length
			? initPages(searchResults, items, cardAll, 'rich', continuation)
			: disablePages(searchResults)

		for (let index = 0, length = cardAll.length; index < length; index++) {
			let card = cardAll[index];
			const { type: typeCard } = items[index];

			card.dataset.win = `${typeCard}`
			card.classList.add(`_${typeCard}`);

			switch (typeCard) {
				case 'video':
					fillVideoCard(card, index, items)
					break;

				case 'playlist':
					fillPlaylistCard(card, index, items)
					break;

				case 'channel':
					fillChannelCard(card, index, items)
					break;
			}
		}
	} catch (error) {
		showToast('error', error.message);
	}
	finally {
		searchResults = null
		searchBar = null
		cardAll = null
	}
}

const filterSearchResults = arr => arr.filter(el => el.type === 'video' || el.type === 'playlist' || el.type === 'channel')
