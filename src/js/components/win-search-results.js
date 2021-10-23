const openWinSearchResults = async _ => {
	let searchResults = _io_q('.search-results')
	let searchBar = _io_q('.header').querySelector('.search__bar');
	let cardAll = searchResults.querySelectorAll('.card');

	try {
		let data = storage.settings.enableProxy
			? await API.scrapeSearchResultsProxy(searchBar.value, getProxyOptions())
			: await API.scrapeSearchResults(searchBar.value)

		data.items.length > cardAll.length
			? initPages(searchResults, data.items, cardAll, 'rich', data.continuation)
			: disablePages(searchResults)

		for (let index = 0, length = cardAll.length; index < length; index++) {
			let card = cardAll[index];
			let typeCard = data.items[index].type;

			card.dataset.win = `${typeCard}`
			card.classList.add(`_${typeCard}`);

			switch (typeCard) {
				case 'video':
					fillVideoCard(card, index, data.items)
					break;

				case 'playlist':
					fillPlaylistCard(card, index, data.items)
					break;

				case 'channel':
					fillChannelCard(card, index, data.items)
					break;
			}
		}
	} catch (error) { showToast('error', error.message); }
	finally {
		searchResults = null
		searchBar = null
		cardAll = null
	}
}
