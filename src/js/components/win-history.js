const openWinHistory = _ => {
	if (storage.settings.disableHistory) return

	const { history } = storage

	const historyWin = _io_q('.history')
	let videoAll = historyWin.querySelectorAll('.card')

	history.length > videoAll.length ? initPages(historyWin, history, videoAll, 'video') : disablePages(historyWin)

	for (let index = 0, { length } = videoAll; index < length; index += 1) {
		const video = videoAll[index]

		video.classList.add('_history-video')

		history[index] ? fillVideoCard(video, index, history) : (video.hidden = true)
	}

	videoAll = null
}

const isThisRecentHistoryItem = newItem => storage.history.length > 0 && newItem.id === storage.history[0].id

const getSameHistoryItem = newItem => storage.history.find(item => item.id === newItem.id)

const removeSameHistoryItem = newItem => {
	storage.history = storage.history.filter(item => item.id !== newItem.id)
}

const addNewHistoryItem = newItem => {
	storage.history = [newItem, ...storage.history]
}

const keepHistoryArray = _ => {
	const numWasteItemAll = storage.history.length - storage.settings.maxHistoryLength

	if (numWasteItemAll <= 0) {
		for (let index = 0; index < numWasteItemAll; index += 1) storage.history.pop()
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

const saveVideoInHistory = data => {
	if (storage.settings.disableHistory) return

	if (data) {
		const newItem = scrapeVideoInfoFromData(data)
		if (!isThisRecentHistoryItem(newItem)) {
			const sameItem = getSameHistoryItem(newItem)

			if (sameItem && sameItem?.watchedTime) {
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

		if (!storage.settings.disableHistory) showToast('good', "History's been cleaned")
	} else if (!storage.settings.disableHistory) showToast('info', "History's empty")
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

const rememberWatchedTime = _ => {
	const { disableHistory, dontRememberWatchedTime } = storage.settings

	if (disableHistory && dontRememberWatchedTime) return

	let videoParent = _io_q('.video')
	let video = videoParent.querySelector('video')

	const watchedTime = video.currentTime

	if (watchedTime === 0) return

	const videoId = videoParent.dataset.id

	for (let index = 0, { length } = storage.history; index < length; index += 1) {
		if (storage.history[index].id === videoId) {
			storage.history[index].watchedTime = watchedTime
			break
		}
	}

	API.writeStorage(storage)

	videoParent = null
	video = null
}

const getItemWithWatchedTime = videoId => storage.history.find(item => item.id === videoId && item?.watchedTime)

const getWatchedtTime = videoId => {
	const { disableHistory, dontRememberWatchedTime } = storage.settings

	if (disableHistory && dontRememberWatchedTime) return

	const requiredItem = getItemWithWatchedTime(videoId)

	return requiredItem && requiredItem.watchedTime
}

const calculateWatchedProgress = videoId => {
	const requiredItem = getItemWithWatchedTime(videoId)

	const lengthSeconds = convertDurationToSeconds(requiredItem.lengthSeconds)

	return `${convertToProc(requiredItem.watchedTime, lengthSeconds)}%`
}
