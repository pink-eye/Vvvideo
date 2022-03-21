import AppStorage from 'Global/AppStorage'
import cs from 'Global/CacheSelectors'
import { fillVideoCard } from 'Components/card/card-video'
import Pages from 'Components/grid-btns'
import { resetGrid } from 'Components/grid'

const WinHistory = () => {
	const history = cs.get('.history')
	const pages = Pages()

	const getData = () => {
		const appStorage = new AppStorage()
		const storage = appStorage.get()

		if (storage.settings.disableHistory) return

		return storage.history
	}

	const fill = data => {
		const videoAll = history.querySelectorAll('.card')

		if (data.length > videoAll.length) {
			pages.init({ element: history, data, type: 'video' })
		}

		for (let index = 0, { length } = videoAll; index < length; index += 1) {
			const video = videoAll[index]

			if (data[index]) {
				video.classList.add('_history-video')

				if ('playlistId' in data[index]) {
					video.dataset.playlistId = data[index].playlistId
				}

				fillVideoCard(video, index, data)
			} else {
				video.hidden = true
			}
		}
	}

	const init = () => {
		const data = getData()

		if (!data) return

		fill(data)
	}

	const reset = () => {
		resetGrid(history)
		pages.reset()
	}

	return {
		init,
		reset,
	}
}

const winHistory = WinHistory()

export default winHistory
