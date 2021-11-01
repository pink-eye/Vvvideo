const openWinHistory = _ => {
	if (!storage.settings.disableHistory) {
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
}

const isThisRecentHistoryItem = newItem => {
	let recentHistoryItem = storage.history[0]
	return !recentHistoryItem || recentHistoryItem.id !== newItem.id
}

const addNewHistoryItem = newItem => {
	storage.history = [newItem].concat(storage.history)
}

const keepHistoryArray = _ => {
	let numWasteItemAll = storage.history.length - storage.settings.maxHistoryLength

	if (numWasteItemAll <= 0) {
		for (let index = 0, length = numWasteItemAll; index < length; index++)
			storage.history.pop()
	}
}

const scrapeVideoInfoFromCard = card => {
	return {
		id: card.dataset.id,
		title: card.querySelector('.card__title span').textContent,
		author: card.querySelector('.card__channel').textContent,
		authorId: card.querySelector('.card__channel').dataset.id,
		bestThumbnail: {
			url: card.querySelector('.card__image img').src
		},
		lengthSeconds: card.querySelector('.card__duration').textContent
	}
}

const scrapeVideoInfoFromData = data => {
	const { videoDetails } = data

	return {
		id: videoDetails.videoId,
		title: videoDetails.title,
		author: videoDetails.author.name,
		authorId: videoDetails.author.authorId,
		bestThumbnail: {
			url: videoDetails.thumbnails.at(-1).url
		},
		lengthSeconds: convertSecondsToDuration(videoDetails.lengthSeconds)
	}
}

const saveToHistoryVideo = (methodToScrapeInfo, arg) => {
	if (arg) {
		let newItem = methodToScrapeInfo(arg)

		if (isThisRecentHistoryItem(newItem)) {
			addNewHistoryItem(newItem)

			keepHistoryArray()

			API.writeStorage(storage)
		}
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
			showToast('info', "History's empty")
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

const rememberWatchedTime = (videoId, watchedTime) => {
	for (let index = 0, length = storage.history.length; index < length; index++) {
		if (storage.history[index].videoId = videoId) {
			storage.history[index].watchedTime = watchedTime
			break
		}
	}

	API.writeStorage(storage)
}

const getWatchedTime = videoId => {
	let watchedTime = null

	for (let index = 0, length = storage.history.length; index < length; index++) {
		if (storage.history[index].videoId = videoId &&
			storage.history[index].hasOwnPropery('watchedTime')) {
			watchedTime = storage.history[index].watchedTime
			break
		}
	}

	return watchedTime
}
