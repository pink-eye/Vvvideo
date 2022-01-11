import { AppStorage } from 'Global/app-storage'
import { getSelector } from 'Global/utils'
import { fillVideoCard } from 'Components/card/card-video'
import { initPages, disablePages } from 'Components/grid-btns'

export const openWinHistory = _ => {
	const appStorage = new AppStorage()
	const storage = appStorage.get()

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
