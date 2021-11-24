import { getSelector, uuidv4 } from '../global'

const createSponsorblockItemHTML = _ => '<li class="sponsorblock__item"></li>'

const getSegmentsSB = id => API.getSponsorblockInfo(id, uuidv4())

const toggleSponsorblock = option => {
	let video = getSelector('.video')
	let sponsorblockBtn = video.querySelector('.controls__sponsorblock')

	sponsorblockBtn.hidden = option

	video = null
	sponsorblockBtn = null
}

export { createSponsorblockItemHTML, getSegmentsSB, toggleSponsorblock }
