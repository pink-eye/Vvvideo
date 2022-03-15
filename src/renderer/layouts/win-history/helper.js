import cs from 'Global/cacheSelectors'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import {
	convertSecondsToDuration,
	convertDurationToSeconds,
	convertToPercentage,
} from 'Global/utils'

const appStorage = new AppStorage()
let storage = null

const isExist = id => storage.history.find(item => item.id === id)

const removeHistoryItem = id => {
	storage.history = storage.history.filter(item => item.id !== id)
}

const addHistoryItem = newItem => {
	storage.history = [newItem, ...storage.history]
}

const restrainHistoryLength = () => {
	const { maxHistoryLength } = storage.settings
	const { history } = storage

	if (history.length > maxHistoryLength) storage.history.length = maxHistoryLength
}

const scrapeVideoInfoFromData = data => {
	const { videoDetails } = data

	const videoObj = {
		id: videoDetails.videoId,
		title: videoDetails.title,
		author: videoDetails.author.name,
		authorId: videoDetails.author.id,
		bestThumbnail: {
			url: videoDetails.thumbnails.at(-1).url,
		},
		lengthSeconds: convertSecondsToDuration(videoDetails.lengthSeconds),
	}

	if ('playlistId' in videoDetails) videoObj.playlistId = videoDetails.playlistId

	return videoObj
}

export const saveVideoInHistory = data => {
	storage = appStorage.get()

	if (storage.settings.disableHistory) return

	if (data) {
		const newItem = scrapeVideoInfoFromData(data)
		const { id } = newItem
		const sameItem = isExist(id)

		if (sameItem) {
			if (sameItem.watchedTime) newItem.watchedTime = sameItem.watchedTime
			removeHistoryItem(id)
		}

		addHistoryItem(newItem)

		restrainHistoryLength()
		appStorage.update(storage)
	}
}

export const clearHistory = async () => {
	storage = appStorage.get()

	if (storage.history.length > 0) {
		storage.history.length = 0
		appStorage.update(storage)

		if (!storage.settings.disableHistory) showToast('good', "History's been cleaned")
	} else if (!storage.settings.disableHistory) showToast('info', "History's empty")
}

export const disableHistory = () => {
	clearHistory()

	let history = cs.get('.history')
	let sidebarBtnHistory = document.querySelector('[data-win="history"]')

	history.remove()
	sidebarBtnHistory.closest('.sidebar__item').remove()

	history = null
	sidebarBtnHistory = null
}

export const rememberWatchedTime = () => {
	storage = appStorage.get()
	const { disableHistory: isDisabledHistory, dontRememberWatchedTime } = storage.settings

	if (isDisabledHistory && dontRememberWatchedTime) return

	const { id } = cs.get('.video').dataset
	const { currentTime, duration } = cs.get('video')

	if (convertToPercentage(currentTime, duration) < 1) return

	for (let index = 0, { length } = storage.history; index < length; index += 1) {
		if (storage.history[index].id === id) {
			storage.history[index].watchedTime = currentTime
			appStorage.update(storage, { isLocal: true })
			return
		}
	}
}

const getItemWithWatchedTime = videoId =>
	storage.history.find(item => item.id === videoId && item?.watchedTime)

export const getWatchedTime = videoId => {
	storage = appStorage.get()
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
