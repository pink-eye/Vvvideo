import { showToast } from './toast'
import { fillVideoCard } from '../../js/components/card'
import { AppStorage } from '../../js/components/app-storage'
import { getSelector, convertSecondsToDuration, convertDurationToSeconds, convertToPercentage } from '../../js/global'
import { initPages, disablePages } from '../../js/components/pages'

const appStorage = new AppStorage()
const storage = appStorage.getStorage()

export const openWinHistory = _ => {
	if (storage.settings.disableHistory) return

	const { history } = storage

	const historyWin = getSelector('.history')
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

export const keepHistoryArray = _ => {
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

export const saveVideoInHistory = data => {
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
			appStorage.updateStorage(storage)
		}
	}
}

export const clearHistory = async _ => {
	if (storage.history.length > 0) {
		storage.history.length = 0
		appStorage.updateStorage(storage)

		if (!storage.settings.disableHistory) showToast('good', "History's been cleaned")
	} else if (!storage.settings.disableHistory) showToast('info', "History's empty")
}

export const disableHistory = _ => {
	clearHistory()

	let history = getSelector('.history')
	let sidebarBtnHistory = document.querySelector('[data-win="history"]')

	history.remove()
	sidebarBtnHistory.closest('.sidebar__item').remove()

	history = null
	sidebarBtnHistory = null
}

export const rememberWatchedTime = _ => {
	const { disableHistory: isDisabledHistory, dontRememberWatchedTime } = storage.settings

	if (isDisabledHistory && dontRememberWatchedTime) return

	let videoParent = getSelector('.video')
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

	appStorage.updateStorage(storage)

	videoParent = null
	video = null
}

const getItemWithWatchedTime = videoId => storage.history.find(item => item.id === videoId && item?.watchedTime)

export const getWatchedtTime = videoId => {
	const { disableHistory: isDisabledHistory, dontRememberWatchedTime } = storage.settings

	if (isDisabledHistory && dontRememberWatchedTime) return

	const requiredItem = getItemWithWatchedTime(videoId)

	return requiredItem && requiredItem.watchedTime
}

export const calculateWatchedProgress = videoId => {
	const requiredItem = getItemWithWatchedTime(videoId)

	const lengthSeconds = convertDurationToSeconds(requiredItem.lengthSeconds)

	return `${convertToPercentage(requiredItem.watchedTime, lengthSeconds)}%`
}
