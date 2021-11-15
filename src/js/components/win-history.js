const openWinHistory = _ => {
	if (storage.settings.disableHistory) return

	const { history } = storage

	let historyWin = _io_q(".history")
	let videoAll = historyWin.querySelectorAll(".card")

	history.length > videoAll.length ? initPages(history, history, videoAll, "video") : disablePages(history)

	for (let index = 0, length = videoAll.length; index < length; index++) {
		const video = videoAll[index]

		video.classList.add("_history-video")

		history[index] ? fillVideoCard(video, index, history) : (video.hidden = true)
	}

	history = null
	videoAll = null
}

const isThisRecentHistoryItem = newItem => storage.history.length > 0 && newItem.id === storage.history[0].id

const getSameHistoryItem = newItem => storage.history.find(item => item.id === newItem.id)

const removeSameHistoryItem = newItem => {
	storage.history = storage.history.filter(item => item.id !== newItem.id)
}

const addNewHistoryItem = newItem => {
	storage.history = [newItem].concat(storage.history)
}

const keepHistoryArray = _ => {
	let numWasteItemAll = storage.history.length - storage.settings.maxHistoryLength

	if (numWasteItemAll <= 0) {
		for (let index = 0, length = numWasteItemAll; index < length; index++) storage.history.pop()
	}
}

const scrapeVideoInfoFromCard = card => {
	return {
		id: card.dataset.id,
		title: card.querySelector(".card__title span").textContent,
		author: card.querySelector(".card__channel").textContent,
		authorId: card.querySelector(".card__channel").dataset.id,
		bestThumbnail: {
			url: card.querySelector(".card__image img").src,
		},
		lengthSeconds: card.querySelector(".card__duration").textContent,
	}
}

const scrapeVideoInfoFromData = data => {
	const { videoDetails } = data

	return {
		id: videoDetails.videoId,
		title: videoDetails.title,
		author: videoDetails.author.name,
		authorId: videoDetails.author.id,
		bestThumbnail: {
			url: videoDetails.thumbnails.at(-1).url,
		},
		lengthSeconds: convertSecondsToDuration(videoDetails.lengthSeconds),
	}
}

const saveVideoInHistory = (methodToScrapeInfo, arg) => {
	if (storage.settings.disableHistory) return

	if (arg) {
		let newItem = methodToScrapeInfo(arg)

		if (!isThisRecentHistoryItem(newItem)) {
			let sameItem = getSameHistoryItem(newItem)

			if (sameItem && sameItem.hasOwnProperty("watchedTime")) {
				newItem.watchedTime = sameItem.watchedTime
				removeSameHistoryItem(newItem)
			}

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

		if (!storage.settings.disableHistory) showToast("good", "History's been cleaned")
	} else {
		if (!storage.settings.disableHistory) showToast("info", "History's empty")
	}
}

const disableHistory = _ => {
	clearHistory()

	let history = _io_q(".history")
	let sidebarBtnHistory = document.querySelector('[data-win="history"]')

	history.remove()
	sidebarBtnHistory.closest(".sidebar__item").remove()

	history = null
	sidebarBtnHistory = null
}

const rememberWatchedTime = _ => {
	const { disableHistory, dontRememberWatchedTime } = storage.settings

	if (disableHistory && dontRememberWatchedTime) return

	let videoParent = _io_q(".video")
	let video = videoParent.querySelector("video")

	let watchedTime = video.currentTime

	if (watchedTime === 0) return

	let videoId = videoParent.dataset.id

	for (let index = 0, length = storage.history.length; index < length; index++) {
		if (storage.history[index].id === videoId) {
			storage.history[index].watchedTime = watchedTime
			break
		}
	}

	API.writeStorage(storage)

	videoParent = null
	video = null
}

const getItemWithWatchedTime = videoId =>
	storage.history.find(item => item.id === videoId && item.hasOwnProperty("watchedTime"))

const getWatchedtTime = videoId => {
	const { disableHistory, dontRememberWatchedTime } = storage.settings

	if (disableHistory && dontRememberWatchedTime) return

	const requiredItem = getItemWithWatchedTime(videoId)

	return requiredItem && requiredItem.watchedTime
}

const calculateWatchedProgress = videoId => {
	const requiredItem = getItemWithWatchedTime(videoId)

	let lengthSeconds = convertDurationToSeconds(requiredItem.lengthSeconds)

	return `${convertToProc(requiredItem.watchedTime, lengthSeconds)}%`
}
