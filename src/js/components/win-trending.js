const openWinTrending = async (geoLocation = 'US', page = 'default') => {
	let trending = _io_q('.trending')
	let videoAll = trending.querySelectorAll('.card');

	let parameters = JSON.parse(`{
		"geoLocation": "${geoLocation}",
		"parseCreatorOnRise": false,
		"page": "${page}"
	}`)

	try {
		const data = await API.scrapeTrending(parameters)

		data.length > videoAll.length
			? initPages(trending, data, videoAll, 'video')
			: disablePages(trending)

		for (let index = 0, length = videoAll.length; index < length; index++) {
			let video = videoAll[index];
			fillVideoCard(video, index, data);
		}
	} catch (error) {
		showToast('error', error.message)
	} finally {
		parameters = null
		videoAll = null;
		trending = null
	}
}
