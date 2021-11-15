let storage = {}
let latestArray = null

const getChannelVideosLocalScraper = channelId =>
	new Promise(async (resolve, reject) => {
		try {
			const data = await API.scrapeChannelVideos(channelId)
			let { items } = data

			startIndicator()

			for (let index = 0, length = items.length; index < length; index++) {
				const video = items[index]

				video.publishedDate = video.liveNow ? new Date().getTime() : calculatePublishedDate(video.publishedText)
			}

			resolve(items)
		} catch (error) {
			showToast("error", error.message)
			resetIndicator()
			reject(error)
		}
	})

const openWinLatest = async _ => {
	let latest = _io_q(".latest")
	let promises = []
	let videoAll = latest.querySelectorAll(".card")

	if (storage.subscriptions.length > 0) {
		let btnLatest = document.querySelector('button[data-win="latest"]')

		for (let index = 0, length = storage.subscriptions.length; index < length; index++) {
			const subscription = storage.subscriptions[index]

			if (btnLatest.classList.contains("_active")) {
				promises.push(getChannelVideosLocalScraper(subscription.channelId))
			} else {
				latestArray.length = 0
				return
			}
		}

		btnLatest = null

		try {
			latestArray = [].concat.apply([], await Promise.all(promises))
			latestArray = await Promise.all(latestArray.sort((a, b) => b.publishedDate - a.publishedDate))

			showToast("good", "Latest uploads is got successfully")
		} catch (error) {
			showToast("error", error.message)
		}

		promises.length = 0

		resetIndicator()

		latestArray?.length > videoAll.length ? initPages(latest, latestArray, videoAll, "video") : disablePages(latest)
	}

	for (let index = 0, length = videoAll.length; index < length; index++) {
		let video = videoAll[index]

		latestArray?.[index] ? fillVideoCard(video, index, latestArray) : (video.hidden = true)
	}

	videoAll = null
	latest = null
}
