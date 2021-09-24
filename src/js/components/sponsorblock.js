let segmentsSB = [];

const SponsorblockItemHTML = _ => `<li class="sponsorblock__item"></li>`

const getSegmentsSB = async videoId => {
	segmentsSB.length = 0
	let video = _io_q('.video');
	let controlsProgess = video.querySelector('.controls__progress');
	let progressSponsorblock = controlsProgess.querySelector('.sponsorblock');
	let sponsorblockItemHTML = SponsorblockItemHTML();

	try {
		let data = await API.getSponsorblockInfo(videoId, uuidv4())

		segmentsSB.push(...data)

		for (let index = 0, length = data.length; index < length; index++)
			progressSponsorblock.insertAdjacentHTML('beforeEnd', sponsorblockItemHTML)

		let sponsorblockItemAll = progressSponsorblock.querySelectorAll('.sponsorblock__item');
		for (let index = 0, length = sponsorblockItemAll.length; index < length; index++) {
			const sponsorblockItem = sponsorblockItemAll[index];
			const segmentLength = data[index].endTime - data[index].startTime;
			sponsorblockItem.style.setProperty('--width', `${convertToProc(segmentLength, data[index].videoDuration)}%`);
			sponsorblockItem.style.setProperty('--left', `${convertToProc(data[index].startTime, data[index].videoDuration)}%`);
		}

		data = null
		sponsorblockItemAll = null

	} catch (error) { }

	finally {
		video = null
		controlsProgess = null
		progressSponsorblock = null
		sponsorblockItemHTML = null
	}

}

const toggleSponsorblock = option => {
	let video = _io_q('.video');
	let sponsorblockBtn = video.querySelector('.controls__sponsorblock');

	sponsorblockBtn.hidden = option

	video = null
	sponsorblockBtn = null
}
