const openWinHistory = _ => {
	let history = _io_q('.history')
	let videoAll = history.querySelectorAll('.card');
	let sh = storage.history

	sh.length > videoAll.length
		? initPages(history, sh, videoAll, 'video')
		: disablePages(history)

	for (let index = 0, length = videoAll.length; index < length; index++) {
		let video = videoAll[index];

		video.classList.add('_history-video');

		sh[index]
			? fillVideoCard(video, index, sh)
			: video.hidden = true;

		video = null;
	}

	history = null
	videoAll = null
	sh = null
}

const saveToHistoryVideo = card => {
	let sh = storage.history
	let recentHistoryItem = sh[0]
	let params = {
		id: card.dataset.id,
		title: card.querySelector('.card__title span').textContent,
		author: card.querySelector('.card__channel').textContent,
		authorId: card.querySelector('.card__channel').dataset.id,
		bestThumbnail: {
			url: card.querySelector('.card__image img').src
		},
		lengthSeconds: card.querySelector('.card__duration').textContent
	}

	if (!recentHistoryItem || recentHistoryItem.id !== params.id) {
		storage.history = [params].concat(sh)

		let numWasteItemAll = storage.history.length - storage.settings.maxHistoryLength

		if (numWasteItemAll <= 0) {
			for (let index = 0, length = numWasteItemAll.length; index < length; index++)
				storage.history.pop()
		}

		API.writeStorage(storage)

		card = null
	}
}

const clearHistory = async _ => {
	if (storage.history.length > 0) {
		storage.history.length = 0
		await API.writeStorage(storage)

		if (!storage.settings.disableHistory)
			showToast('good', "History's been cleaned")
	} else {

		if (!storage.settings.disableHistory)
			showToast('good', "History's empty")
	}
}

const disableHistory = _ => {
	clearHistory()

	let history = _io_q('.history')
	let sidebarBtnHistory = document.querySelector('[data-win="history"]')

	history.remove()
	sidebarBtnHistory.closest('.sidebar__item').remove()

	history = null
	sidebarBtnHistory = null
}
