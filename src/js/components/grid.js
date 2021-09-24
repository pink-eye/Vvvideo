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

const resetGrid = async parent => {
	const cardAll = parent.querySelectorAll('.card')

	if (cardAll.length > 0) {
		for (let index = 0, length = cardAll.length; index < length; index++) {
			let card = cardAll[index];

			resetCard(card)

			if (parent.classList.contains('search-results')) {
				card.dataset.win = null;

				if (card.classList.contains('_video'))
					card.classList.remove('_video');
				if (card.classList.contains('_playlist'))
					card.classList.remove('_playlist');
				if (card.classList.contains('_channel'))
					card.classList.remove('_channel');
				if (card.classList.contains('_live'))
					card.classList.remove('_live');
			}
		}
	}
}
