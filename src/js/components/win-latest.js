let storage = {}
let latestArray = null;

const getChannelVideosLocalScraper = (channelId, index) => new Promise(async (resolve) => {
	let indicator = _io_q('.indicator');

	try {
		const data = await API.scrapeChannelVideos(channelId);

		startIndicator()

		for (let index = 0, length = data.items.length; index < length; index++) {
			let video = data.items[index];

			video.liveNow
				? video.publishedDate = new Date().getTime()
				: video.publishedDate = calculatePublishedDate(video.publishedText)

			video = null
		}

		indicator = null
		resolve(data.items)
	} catch (error) {
		showToast('error', error.message)
		resetIndicator()
	}
})

const openWinLatest = async _ => {
	let latest = _io_q('.latest');
	let promises = []
	let videoAll = latest.querySelectorAll('.card');

	if (storage.subscriptions.length > 0) {
		if (!latestArray) {
			let btnLatest = document.querySelector('button[data-win="latest"]');

			for (let index = 0, length = storage.subscriptions.length; index < length; index++) {
				const subscription = storage.subscriptions[index];

				if (btnLatest.classList.contains('_active')) {
					promises.push(getChannelVideosLocalScraper(subscription.channelId, index))
				} else {
					latestArray.length = 0
					return
				}
			}

			latestArray = [].concat.apply([], await Promise.all(promises));
			latestArray = await Promise.all(latestArray.sort((a, b) => b.publishedDate - a.publishedDate))
			showToast('good', 'Latest uploads is got successfully')
			promises.length = 0

			resetIndicator()

			latestArray.length > videoAll.length
				? initPages(latest, latestArray, videoAll, 'video')
				: disablePages(latest)

			for (let index = 0, length = videoAll.length; index < length; index++) {
				let video = videoAll[index];

				latestArray[index]
					? fillVideoCard(video, index, latestArray)
					: video.hidden = true;
			}

			btnLatest = null;
		} else {
			latestArray.length > videoAll.length
				? initPages(latest, latestArray, videoAll, 'video')
				: disablePages(latest)

			for (let index = 0, length = videoAll.length; index < length; index++) {
				let video = videoAll[index];

				latestArray[index]
					? fillVideoCard(video, index, latestArray)
					: video.hidden = true;
			}
		}
	} else {
		for (let index = 0, length = videoAll.length; index < length; index++)
			videoAll[index].hidden = true;
	}

	videoAll = null;
	latest = null;
}

