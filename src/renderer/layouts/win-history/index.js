import { AppStorage } from 'Global/app-storage'
import { getSelector } from 'Global/utils'
import { fillVideoCard } from 'Components/card/card-video'
import { initPages, disablePages } from 'Components/grid-btns'

export const openWinHistory = () => {
	const appStorage = new AppStorage()
	const storage = appStorage.get()

	if (storage.settings.disableHistory) return

	const { history } = storage

	const historyWin = getSelector('.history')
	let videoAll = historyWin.querySelectorAll('.card')

	history.length > videoAll.length
		? initPages(historyWin, history, videoAll, 'video')
		: disablePages(historyWin)

	for (let index = 0, { length } = videoAll; index < length; index += 1) {
		let video = videoAll[index]

		video.classList.add('_history-video')

		if ('playlistId' in history[index]) video.dataset.playlistId = history[index].playlistId

		history[index] ? fillVideoCard(video, index, history) : (video.hidden = true)

		video = null
	}

	videoAll = null
}
