import { AppStorage } from 'Global/app-storage'
import { showToast } from 'Components/toast'
import { getSelector, convertSecondsToDuration, convertDurationToSeconds, convertToPercentage } from 'Global/utils'

const appStorage = new AppStorage()
let storage = null

const isRecent = newItem => storage.history.length > 0 && newItem.id === storage.history[0].id

const isExist = id => storage.history.find(item => item.id === id)

const removeHistoryItem = id => {
	storage.history = storage.history.filter(item => item.id !== id)
}

const addHistoryItem = newItem => {
	storage.history = [newItem, ...storage.history]
}

const restrainHistoryLength = _ => {
	const { maxHistoryLength } = storage.settings
	const { history } = storage

	if (history.length > maxHistoryLength) storage.history.length = maxHistoryLength

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
	storage = appStorage.getStorage()

	if (storage.settings.disableHistory) return

	if (data) {
		const newItem = scrapeVideoInfoFromData(data)
		if (!isRecent(newItem)) {
			const { id } = newItem
			const sameItem = isExist(id)

			if (sameItem && sameItem?.watchedTime) {
				newItem.watchedTime = sameItem.watchedTime
				removeHistoryItem(id)
			}

			addHistoryItem(newItem)

			restrainHistoryLength()
			appStorage.updateStorage(storage)
		}
	}
}

export const clearHistory = async _ => {
	storage = appStorage.getStorage()

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
	storage = appStorage.getStorage()
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

export const getWatchedTime = videoId => {
	storage = appStorage.getStorage()
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
