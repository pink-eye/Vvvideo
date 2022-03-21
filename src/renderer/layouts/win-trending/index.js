import cs from 'Global/CacheSelectors'
import Pages from 'Components/grid-btns'
import { fillVideoCard } from 'Components/card/card-video'
import { resetGrid } from 'Components/grid'
import showToast from 'Components/toast'
import AppStorage from 'Global/AppStorage'

const WinTrending = () => {
	const appStorage = new AppStorage()
	const pages = Pages()
	const trending = cs.get('.trending')
	const config = { geoLocation: 'US', parseCreatorOnRise: false, page: 'default' }

	const fetchData = () => API.scrapeTrending(config)

	const fill = data => {
		const videoAll = trending.querySelectorAll('.card')

		if (data.length > videoAll.length) {
			pages.init({ element: trending, type: 'video', data })
		}

		for (let index = 0, { length } = videoAll; index < length; index += 1) {
			const video = videoAll[index]

			fillVideoCard(video, index, data)
		}
	}

	const init = () => {
		const { settings } = appStorage.get()
		config.geoLocation = settings.regionTrending

		fetchData()
			.then(fill)
			.catch(({ message }) => showToast('error', message))
	}

	const reset = () => {
		resetGrid(trending)
		pages.reset()
	}

	return {
		init,
		reset,
	}
}

const winTrending = WinTrending()

export default winTrending
