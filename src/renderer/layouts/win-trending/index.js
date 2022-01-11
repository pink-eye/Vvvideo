import { getSelector } from 'Global/utils'
import { initPages, disablePages } from 'Components/grid-btns'
import { fillVideoCard } from 'Components/card/card-video'
import { showToast } from 'Components/toast'

export const openWinTrending = async (geoLocation = 'US', page = 'default') => {
	let trending = getSelector('.trending')
	let videoAll = trending.querySelectorAll('.card')

	let parameters = {
		geoLocation,
		parseCreatorOnRise: false,
		page,
	}

	try {
		const data = await API.scrapeTrending(parameters)

		data.length > videoAll.length ? initPages(trending, data, videoAll, 'video') : disablePages(trending)

		for (let index = 0, { length } = videoAll; index < length; index += 1) {
			const video = videoAll[index]
			fillVideoCard(video, index, data)
		}
	} catch ({ message }) {
		showToast('error', message)
	} finally {
		parameters = null
		videoAll = null
		trending = null
	}
}
