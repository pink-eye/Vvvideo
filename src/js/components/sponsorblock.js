const segmentsSB = []

const createSponsorblockItemHTML = _ => '<li class="sponsorblock__item"></li>'

const getSegmentsSB = async videoId => {
	segmentsSB.length = 0

	const { disableSponsorblock } = storage.settings

	toggleSponsorblock(disableSponsorblock)

	if (disableSponsorblock) return

	let video = _io_q('.video')
	let controlsProgess = video.querySelector('.controls__progress')
	let progressSponsorblock = controlsProgess.querySelector('.sponsorblock')
	let sponsorblockItemHTML = createSponsorblockItemHTML()

	try {
		let data = await API.getSponsorblockInfo(videoId, uuidv4())

		segmentsSB.push(...data)

		if (data.length > 0) {
			for (let index = 0, { length } = data; index < length; index += 1)
				progressSponsorblock.insertAdjacentHTML('beforeEnd', sponsorblockItemHTML)
		}

		data = null
	} catch (error) {
		showToast('info', `Sponsorblock doesn't have segments for this video`)
	} finally {
		video = null
		controlsProgess = null
		progressSponsorblock = null
		sponsorblockItemHTML = null
	}
}

const toggleSponsorblock = option => {
	let video = _io_q('.video')
	let sponsorblockBtn = video.querySelector('.controls__sponsorblock')

	sponsorblockBtn.hidden = option

	video = null
	sponsorblockBtn = null
}
