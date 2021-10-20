const resetGridAuthorCard = async _ => {
	let subscriptions = _io_q('.subscriptions')
	let authorAll = subscriptions.querySelectorAll('.author');

	for (let index = 0, length = authorAll.length; index < length; index++) {
		const author = authorAll[index];
		resetAuthorCard(author)
	}

	subscriptions = null
	authorAll = null
}


const resetGrid = parent => {
	const cardAll = parent.querySelectorAll('.card')

	if (cardAll.length > 0) {
		const typeAll = {
			video: '_video',
			playlist: '_playlist',
			channel: '_channel',
			live: '_live'
		}

		for (let index = 0, length = cardAll.length; index < length; index++) {
			let card = cardAll[index];

			resetCard(card)

			if (parent.classList.contains('search-results')) {
				card.dataset.win = null;

				for (let key in typeAll) {
					if (card.classList.contains(typeAll[key])) {
						card.classList.remove(typeAll[key]);
						break;
					}
				}
			}
		}
	}
}
