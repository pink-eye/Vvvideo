import cs from 'Global/CacheSelectors'
import AppStorage from 'Global/AppStorage'
import showToast from 'Components/toast'
import { fillVideoCard } from 'Components/card/card-video'
import { initPages, disablePages } from 'Components/grid-btns'
import { calculatePublishedDate } from 'Layouts/win-latest/helper'
import { startIndicator, resetIndicator } from 'Components/indicator'

let latestArray = null

const getChannelVideosLocalScraper = channelId =>
	new Promise((resolve, reject) => {
		API.scrapeChannelVideos(channelId)
			.then(data => {
				let { items } = data

				for (let index = 0, { length } = items; index < length; index += 1) {
					const video = items[index]

					video.publishedDate = video.liveNow
						? new Date().getTime()
						: calculatePublishedDate(video.publishedText)
				}

				resolve(items)
			})
			.catch(reject)
	})

const openWinLatest = async () => {
	let latest = cs.get('.latest')
	let promises = []
	let videoAll = latest.querySelectorAll('.card')

	const appStorage = new AppStorage()
	const { subscriptions } = appStorage.get()

	if (subscriptions?.length > 0) {
		let btnLatest = document.querySelector('button[data-win="latest"]')

		for (let index = 0, { length } = subscriptions; index < length; index += 1) {
			const subscription = subscriptions[index]

			if (btnLatest.classList.contains('_active')) {
				promises.push(getChannelVideosLocalScraper(subscription.channelId))
			} else {
				latestArray.length = 0
				return
			}
		}

		btnLatest = null

		try {
			startIndicator()
			latestArray = await Promise.all(promises)
			latestArray = latestArray.flat()
			latestArray = latestArray.sort((a, b) => b.publishedDate - a.publishedDate)

			showToast('good', 'Latest uploads is got successfully')
		} catch ({ message }) {
			showToast('error', message)
		} finally {
			resetIndicator()
		}

		latestArray?.length > videoAll.length
			? initPages(latest, latestArray, videoAll, 'video')
			: disablePages(latest)
	} else showToast('info', `Oops... You don't have subscriptions`)

	for (let index = 0, { length } = videoAll; index < length; index += 1) {
		let video = videoAll[index]

		latestArray?.[index] ? fillVideoCard(video, index, latestArray) : (video.hidden = true)

		video = null
	}

	videoAll = null
	latest = null
}

export default openWinLatest
