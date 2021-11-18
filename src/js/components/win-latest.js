let storage = {}
let latestArray = null

const getChannelVideosLocalScraper = channelId =>
	new Promise(async (resolve, reject) => {
		try {
			const data = await API.scrapeChannelVideos(channelId)
			let { items } = data

			startIndicator()

			for (let index = 0, { length } = items; index < length; index += 1) {
				const video = items[index]

				video.publishedDate = video.liveNow ? new Date().getTime() : calculatePublishedDate(video.publishedText)
			}

			resolve(items)
		} catch (error) {
			showToast('error', error.message)
			resetIndicator()
			reject(error)
		}
	})

const openWinLatest = async _ => {
	let latest = _io_q('.latest')
	let promises = []
	let videoAll = latest.querySelectorAll('.card')

	const { subscriptions } = storage

	if (subscriptions.length > 0) {
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
			latestArray = await Promise.all(promises)
			latestArray = latestArray.flat()
			latestArray = latestArray.sort((a, b) => b.publishedDate - a.publishedDate)

			showToast('good', 'Latest uploads is got successfully')
		} catch (error) {
			showToast('error', error.message)
		}

		promises.length = 0

		resetIndicator()

		latestArray?.length > videoAll.length ? initPages(latest, latestArray, videoAll, 'video') : disablePages(latest)
	}

	for (let index = 0, { length } = videoAll; index < length; index += 1) {
		let video = videoAll[index]

		latestArray?.[index] ? fillVideoCard(video, index, latestArray) : (video.hidden = true)
	}

	videoAll = null
	latest = null
}
