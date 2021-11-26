import { getSelector, uuidv4 } from '../../../js/global'

const createSponsorblockItemHTML = _ => '<li class="sponsorblock__item"></li>'

const uuidv4 = _ =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		let r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})

const getSegmentsSB = id => API.getSponsorblockInfo(id, uuidv4())

const toggleSponsorblock = option => {
	let video = getSelector('.video')
	let sponsorblockBtn = video.querySelector('.controls__sponsorblock')

	sponsorblockBtn.hidden = option

	video = null
	sponsorblockBtn = null
}

export { createSponsorblockItemHTML, getSegmentsSB, toggleSponsorblock }
