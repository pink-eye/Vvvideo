import { initPages, disablePages } from '../../js/components/pages'
import { fillVideoCard } from '../../js/components/card'
import { showToast } from './toast'
import { getSelector } from '../../js/global'

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
	} catch (error) {
		showToast('error', error.message)
	} finally {
		parameters = null
		videoAll = null
		trending = null
	}
}
