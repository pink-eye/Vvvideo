import AppStorage from 'Global/AppStorage'
import { getSelector } from 'Global/utils'
import { fillVideoCard } from 'Components/card/card-video'
import { initPages, disablePages } from 'Components/grid-btns'

const openWinHistory = () => {
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

		if (history[index]) {
			if ('playlistId' in history[index]) video.dataset.playlistId = history[index].playlistId

			fillVideoCard(video, index, history)
		} else video.hidden = true

		video = null
	}

	videoAll = null
}

export default openWinHistory
